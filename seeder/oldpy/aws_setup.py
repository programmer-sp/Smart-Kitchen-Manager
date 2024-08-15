import boto3
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError, NoCredentialsError, NoRegionError

# Load environment variables from the .env file
load_dotenv(override=True)

# Accessing the environment variables
aws_access_key_id = os.getenv('AWS_ACCESS_KEYID')
aws_secret_access_key = os.getenv('AWS_ACCESS_SECRET')
aws_default_region = os.getenv('AWS_DEFAULT_REGION', 'ca-central-1')

postgres_username = os.getenv('POSTGRES_USERNAME')
postgres_password = os.getenv('POSTGRES_PASSWORD')
postgres_db = os.getenv('POSTGRES_DB')
postgres_port = os.getenv('POSTGRES_PORT', 5432)

# Prefix for resource names
resource_prefix = "SmartKitchenHelper_"

# Configure boto3 session
class AWSConnection:
    def __init__(self, region_name=aws_default_region):
        try:
            self.session = boto3.Session(
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                region_name=region_name
            )
            self.ec2 = self.session.client('ec2')
            self.elb = self.session.client('elbv2')
            self.asg = self.session.client('autoscaling')
            print("AWS session initialized successfully")
        except (NoCredentialsError, NoRegionError) as e:
            print(f"Error initializing AWS session: {e}")
            raise

class VPCSetup:
    def __init__(self, connection):
        self.ec2 = connection.ec2
        self.vpc_id = None
        print("VPC Setup initialized")

    def create_vpc(self, cidr_block='10.0.0.0/16'):
        try:
            response = self.ec2.create_vpc(CidrBlock=cidr_block)
            self.vpc_id = response['Vpc']['VpcId']
            self.ec2.create_tags(Resources=[self.vpc_id], Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}VPC'}])
            print(f"VPC created with ID: {self.vpc_id}")
            return self.vpc_id
        except ClientError as e:
            print(f"Error creating VPC: {e}")
            return None

    def create_subnet(self, cidr_block, availability_zone, name):
        if not self.vpc_id:
            print("VPC must be created before creating subnets.")
            return None

        try:
            response = self.ec2.create_subnet(VpcId=self.vpc_id, CidrBlock=cidr_block, AvailabilityZone=availability_zone)
            subnet_id = response['Subnet']['SubnetId']
            self.ec2.create_tags(Resources=[subnet_id], Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}{name}'}])
            print(f"Subnet '{name}' created with ID: {subnet_id}")
            return subnet_id
        except ClientError as e:
            print(f"Error creating subnet: {e}")
            return None

    def create_internet_gateway(self):
        if not self.vpc_id:
            print("VPC must be created before creating an Internet Gateway.")
            return None

        try:
            response = self.ec2.create_internet_gateway()
            igw_id = response['InternetGateway']['InternetGatewayId']
            self.ec2.attach_internet_gateway(InternetGatewayId=igw_id, VpcId=self.vpc_id)
            self.ec2.create_tags(Resources=[igw_id], Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}InternetGateway'}])
            print(f"Internet Gateway created with ID: {igw_id}")
            return igw_id
        except ClientError as e:
            print(f"Error creating Internet Gateway: {e}")
            return None

    def create_route_table(self, igw_id, subnets):
        if not self.vpc_id:
            print("VPC must be created before creating a Route Table.")
            return None

        try:
            response = self.ec2.create_route_table(VpcId=self.vpc_id)
            route_table_id = response['RouteTable']['RouteTableId']
            self.ec2.create_route(RouteTableId=route_table_id, DestinationCidrBlock='0.0.0.0/0', GatewayId=igw_id)
            self.ec2.create_tags(Resources=[route_table_id], Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}PublicRouteTable'}])
            print(f"Route Table created with ID: {route_table_id}")

            for subnet_id in subnets:
                self.ec2.associate_route_table(SubnetId=subnet_id, RouteTableId=route_table_id)
                print(f"Subnet ID {subnet_id} associated with Route Table {route_table_id}")

            return route_table_id
        except ClientError as e:
            print(f"Error creating Route Table: {e}")
            return None

    def create_nat_gateway(self, subnet_id):
        if not subnet_id:
            print("A subnet must be specified to create a NAT Gateway.")
            return None

        try:
            allocation = self.ec2.allocate_address(Domain='vpc')
            eip_allocation_id = allocation['AllocationId']
            response = self.ec2.create_nat_gateway(SubnetId=subnet_id, AllocationId=eip_allocation_id)
            nat_gateway_id = response['NatGateway']['NatGatewayId']
            self.ec2.create_tags(Resources=[nat_gateway_id], Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}NATGateway'}])
            print(f"NAT Gateway created with ID: {nat_gateway_id}")
            return nat_gateway_id
        except ClientError as e:
            print(f"Error creating NAT Gateway: {e}")
            return None

    def delete_vpc(self):
        try:
            if self.vpc_id:
                print(f"Deleting VPC: {self.vpc_id}")
                self.ec2.delete_vpc(VpcId=self.vpc_id)
                print(f"VPC {self.vpc_id} deleted successfully.")
            else:
                print("No VPC to delete.")
        except ClientError as e:
            print(f"Error deleting VPC: {e}")

class SecurityGroupSetup:
    def __init__(self, connection, vpc_id):
        self.ec2 = connection.ec2
        self.vpc_id = vpc_id
        self.sg_ids = []
        print("Security Group Setup initialized")

    def create_security_group(self, name, description, rules):
        if not self.vpc_id:
            print("VPC must be created before creating Security Groups.")
            return None

        try:
            response = self.ec2.create_security_group(GroupName=f'{resource_prefix}{name}', Description=description, VpcId=self.vpc_id)
            sg_id = response['GroupId']
            self.ec2.create_tags(Resources=[sg_id], Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}{name}'}])
            print(f"Security Group '{name}' created with ID: {sg_id}")

            for rule in rules:
                self.ec2.authorize_security_group_ingress(
                    GroupId=sg_id, 
                    IpProtocol=rule['protocol'],
                    FromPort=rule['from_port'], 
                    ToPort=rule['to_port'],
                    CidrIp=rule['cidr_ip']
                )
                print(f"Ingress Rule {rule['protocol']} {rule['from_port']}->{rule['to_port']} added to SG {sg_id}")

            self.sg_ids.append(sg_id)
            return sg_id
        except ClientError as e:
            print(f"Error creating Security Group: {e}")
            return None
    
    def update_security_group_rules(self, sg_id, rules):
        try:
            for rule in rules:
                self.ec2.authorize_security_group_ingress(
                    GroupId=sg_id, 
                    IpProtocol=rule['protocol'],
                    FromPort=rule['from_port'], 
                    ToPort=rule['to_port'],
                    CidrIp=rule['cidr_ip']
                )
                print(f"Ingress Rule {rule['protocol']} {rule['from_port']}->{rule['to_port']} added to SG {sg_id}")
        except ClientError as e:
            print(f"Error updating Security Group rules: {e}")
    
    def delete_security_groups(self):
        for sg_id in self.sg_ids:
            try:
                print(f"Deleting Security Group: {sg_id}")
                self.ec2.delete_security_group(GroupId=sg_id)
                print(f"Security Group {sg_id} deleted successfully.")
            except ClientError as e:
                print(f"Error deleting Security Group: {e}")

class EC2InstanceSetup:
    def __init__(self, connection):
        self.ec2 = connection.ec2
        self.instances = []
        print("EC2 Instance Setup initialized")

    def launch_instance(self, subnet_id, sg_id, user_data, name):
        try:
            instance = self.ec2.run_instances(
                ImageId='ami-0c55b159cbfafe1f0',  # Replace with appropriate AMI
                InstanceType='t2.micro',
                MaxCount=1,
                MinCount=1,
                NetworkInterfaces=[{
                    'SubnetId': subnet_id,
                    'DeviceIndex': 0,
                    'AssociatePublicIpAddress': False,
                    'Groups': [sg_id]
                }],
                UserData=user_data,
                TagSpecifications=[{
                    'ResourceType': 'instance',
                    'Tags': [{'Key': 'Name', 'Value': f'{resource_prefix}{name}'}]
                }]
            )
            instance_id = instance['Instances'][0]['InstanceId']
            print(f"EC2 Instance '{name}' launched with ID: {instance_id}")
            self.instances.append(instance_id)
            return instance_id
        except ClientError as e:
            print(f"Error launching EC2 instance: {e}")
            return None

    def terminate_instances(self):
        for instance_id in self.instances:
            try:
                print(f"Terminating EC2 Instance: {instance_id}")
                self.ec2.terminate_instances(InstanceIds=[instance_id])
                print(f"EC2 Instance {instance_id} terminated successfully.")
            except ClientError as e:
                print(f"Error terminating EC2 instance: {e}")

class LoadBalancerSetup:
    def __init__(self, connection):
        self.elb = connection.elb
        self.lb_arn = None
        self.tg_arn = None
        print("Load Balancer Setup initialized")

    def create_load_balancer(self, subnets, sg_id):
        try:
            response = self.elb.create_load_balancer(
                Name=f'{resource_prefix}ALB',
                Subnets=subnets,
                SecurityGroups=[sg_id],
                Scheme='internet-facing',
                Type='application',
                IpAddressType='ipv4'
            )
            self.lb_arn = response['LoadBalancers'][0]['LoadBalancerArn']
            print(f"Load Balancer created with ARN: {self.lb_arn}")
            return self.lb_arn
        except ClientError as e:
            print(f"Error creating Load Balancer: {e}")
            return None

    def create_target_group(self, vpc_id):
        try:
            response = self.elb.create_target_group(
                Name=f'{resource_prefix}TargetGroup',
                Protocol='HTTP',
                Port=80,
                VpcId=vpc_id,
                HealthCheckProtocol='HTTP',
                HealthCheckPath='/',
                TargetType='instance'
            )
            self.tg_arn = response['TargetGroups'][0]['TargetGroupArn']
            print(f"Target Group created with ARN: {self.tg_arn}")
            return self.tg_arn
        except ClientError as e:
            print(f"Error creating Target Group: {e}")
            return None

    def register_targets(self, instance_ids):
        if not self.tg_arn:
            print("Target Group must be created before registering targets.")
            return None

        try:
            targets = [{'Id': instance_id} for instance_id in instance_ids]
            self.elb.register_targets(TargetGroupArn=self.tg_arn, Targets=targets)
            print(f"Instances registered to Target Group ARN: {self.tg_arn}")
        except ClientError as e:
            print(f"Error registering targets: {e}")

    def create_listener(self):
        if not self.lb_arn or not self.tg_arn:
            print("Load Balancer and Target Group must be created before creating a listener.")
            return None

        try:
            self.elb.create_listener(
                LoadBalancerArn=self.lb_arn,
                Protocol='HTTP',
                Port=80,
                DefaultActions=[{
                    'Type': 'forward',
                    'TargetGroupArn': self.tg_arn
                }]
            )
            print("Listener created and linked to Target Group")
        except ClientError as e:
            print(f"Error creating Listener: {e}")

    def delete_load_balancer(self):
        try:
            if self.lb_arn:
                # Remove Listener before deleting Load Balancer
                listeners = self.elb.describe_listeners(LoadBalancerArn=self.lb_arn)['Listeners']
                for listener in listeners:
                    listener_arn = listener['ListenerArn']
                    print(f"Deleting Listener: {listener_arn}")
                    self.elb.delete_listener(ListenerArn=listener_arn)

                print(f"Deleting Load Balancer: {self.lb_arn}")
                self.elb.delete_load_balancer(LoadBalancerArn=self.lb_arn)
                print(f"Load Balancer {self.lb_arn} deleted successfully.")

                if self.tg_arn:
                    print(f"Deleting Target Group: {self.tg_arn}")
                    self.elb.delete_target_group(TargetGroupArn=self.tg_arn)
                    print(f"Target Group {self.tg_arn} deleted successfully.")
            else:
                print("No Load Balancer to delete.")
        except ClientError as e:
            print(f"Error deleting Load Balancer or Target Group: {e}")

class AutoScalingSetup:
    def __init__(self, connection):
        self.asg = connection.asg
        self.asg_name = None
        print("Auto Scaling Group Setup initialized")

    def create_auto_scaling_group(self, launch_config_name, tg_arn, vpc_zone_identifiers):
        try:
            self.asg_name = f'{resource_prefix}ASG'
            response = self.asg.create_auto_scaling_group(
                AutoScalingGroupName=self.asg_name,
                LaunchConfigurationName=launch_config_name,
                MinSize=2,
                MaxSize=4,
                DesiredCapacity=2,
                DefaultCooldown=300,
                TargetGroupARNs=[tg_arn],
                VPCZoneIdentifier=vpc_zone_identifiers,
                HealthCheckType='ELB',
                HealthCheckGracePeriod=120,
            )
            print("Auto Scaling Group created")
        except ClientError as e:
            print(f"Error creating Auto Scaling Group: {e}")

    def create_launch_configuration(self, sg_id, user_data):
        try:
            launch_config_name = f'{resource_prefix}LaunchConfig'
            self.asg.create_launch_configuration(
                LaunchConfigurationName=launch_config_name,
                ImageId='ami-0c55b159cbfafe1f0',  # Replace with appropriate AMI
                InstanceType='t2.micro',
                SecurityGroups=[sg_id],
                UserData=user_data
            )
            print("Launch Configuration created")
            return launch_config_name
        except ClientError as e:
            print(f"Error creating Launch Configuration: {e}")
            return None

    def create_scaling_policies(self):
        if not self.asg_name:
            print("Auto Scaling Group must be created before creating scaling policies.")
            return None

        try:
            # Create Scale-Out Policy (Scale up when CPU > 60%)
            scale_out_policy = self.asg.put_scaling_policy(
                AutoScalingGroupName=self.asg_name,
                PolicyName=f'{resource_prefix}ScaleOutPolicy',
                PolicyType='SimpleScaling',
                AdjustmentType='ChangeInCapacity',
                ScalingAdjustment=1,  # Increase the number of instances by 1
                Cooldown=300,
                MetricAggregationType='Average',
                Threshold=60.0,
                ComparisonOperator='GreaterThanThreshold',
                Statistic='Average',
                Dimensions=[{
                    'Name': 'AutoScalingGroupName',
                    'Value': self.asg_name
                }],
                Namespace='AWS/EC2',
                MetricName='CPUUtilization'
            )

            print(f"Scale-Out Policy created: {scale_out_policy['PolicyARN']}")

            # Create Scale-In Policy (Scale down when CPU < 30%)
            scale_in_policy = self.asg.put_scaling_policy(
                AutoScalingGroupName=self.asg_name,
                PolicyName=f'{resource_prefix}ScaleInPolicy',
                PolicyType='SimpleScaling',
                AdjustmentType='ChangeInCapacity',
                ScalingAdjustment=-1,  # Decrease the number of instances by 1
                Cooldown=300,
                MetricAggregationType='Average',
                Threshold=30.0,
                ComparisonOperator='LessThanThreshold',
                Statistic='Average',
                Dimensions=[{
                    'Name': 'AutoScalingGroupName',
                    'Value': self.asg_name
                }],
                Namespace='AWS/EC2',
                MetricName='CPUUtilization'
            )

            print(f"Scale-In Policy created: {scale_in_policy['PolicyARN']}")

        except ClientError as e:
            print(f"Error creating Scaling Policies: {e}")

    def delete_auto_scaling_group(self):
        try:
            if self.asg_name:
                print(f"Deleting Auto Scaling Group: {self.asg_name}")
                self.asg.delete_auto_scaling_group(
                    AutoScalingGroupName=self.asg_name,
                    ForceDelete=True
                )
                print(f"Auto Scaling Group {self.asg_name} deleted successfully.")
            else:
                print("No Auto Scaling Group to delete.")
        except ClientError as e:
            print(f"Error deleting Auto Scaling Group: {e}")

class RDSDeployment:
    def __init__(self, connection):
        self.rds = connection.rds
        self.ec2 = connection.ec2
        self.primary_az = None
        self.secondary_az = None
        print("RDS Deployment initialized")

    def get_availability_zones_from_asg_instances(self, instance_ids):
        try:
            response = self.ec2.describe_instances(InstanceIds=instance_ids)
            azs = list(set(instance['Placement']['AvailabilityZone'] for reservation in response['Reservations'] for instance in reservation['Instances']))
            if len(azs) < 2:
                raise ValueError("Not enough availability zones available for Multi-AZ deployment.")
            self.primary_az, self.secondary_az = azs[0], azs[1]
            print(f"Primary AZ: {self.primary_az}, Secondary AZ: {self.secondary_az}")
            return self.primary_az, self.secondary_az
        except ClientError as e:
            print(f"Error fetching availability zones from ASG instances: {e}")
            return None, None

    def deploy_rds_instance(self, db_instance_identifier):
        if not self.primary_az or not self.secondary_az:
            print("Availability zones must be set before deploying RDS instance.")
            return None

        try:
            response = self.rds.create_db_instance(
                DBInstanceIdentifier=db_instance_identifier,
                AllocatedStorage=20,
                DBName=postgres_db,
                Engine='postgres',
                MasterUsername=postgres_username,
                MasterUserPassword=postgres_password,
                DBInstanceClass='db.t3.micro',
                MultiAZ=True,
                AvailabilityZone=self.primary_az,
                BackupRetentionPeriod=7,
                Port=postgres_port,
                StorageType='gp2',
                PubliclyAccessible=False,
                Tags=[{'Key': 'Name', 'Value': f'{resource_prefix}RDSInstance'}],
                StorageEncrypted=True,
                EnableIAMDatabaseAuthentication=False
            )
            db_instance_arn = response['DBInstance']['DBInstanceArn']
            print(f"RDS Instance '{db_instance_identifier}' deployed with Multi-AZ support. ARN: {db_instance_arn}")
            
            # Fetch the endpoint address
            waiter = self.rds.get_waiter('db_instance_available')
            waiter.wait(DBInstanceIdentifier=db_instance_identifier)
            db_instance = self.rds.describe_db_instances(DBInstanceIdentifier=db_instance_identifier)
            endpoint = db_instance['DBInstances'][0]['Endpoint']['Address']
            print(f"RDS Instance Endpoint: {endpoint}")

            return db_instance_arn, endpoint
        except ClientError as e:
            print(f"Error deploying RDS instance: {e}")
            return None, None

    def delete_rds_instance(self, db_instance_identifier):
        try:
            print(f"Deleting RDS Instance: {db_instance_identifier}")
            self.rds.delete_db_instance(
                DBInstanceIdentifier=db_instance_identifier,
                SkipFinalSnapshot=True,
                DeleteAutomatedBackups=True
            )
            print(f"RDS Instance {db_instance_identifier} deleted successfully.")
        except ClientError as e:
            print(f"Error deleting RDS instance: {e}")


def main():
    aws_conn = AWSConnection()

    # Step 1: VPC Setup
    vpc_setup = VPCSetup(aws_conn)
    vpc_id = vpc_setup.create_vpc()
    subnet_public_1 = vpc_setup.create_subnet('10.0.1.0/24', 'ca-central-1a', 'PublicSubnet1')
    subnet_private_1 = vpc_setup.create_subnet('10.0.2.0/24', 'ca-central-1a', 'PrivateSubnet1')
    subnet_public_2 = vpc_setup.create_subnet('10.0.3.0/24', 'ca-central-1b', 'PublicSubnet2')
    subnet_private_2 = vpc_setup.create_subnet('10.0.4.0/24', 'ca-central-1b', 'PrivateSubnet2')
    igw_id = vpc_setup.create_internet_gateway()
    route_table_id = vpc_setup.create_route_table(igw_id, [subnet_public_1, subnet_public_2])
    nat_gw_id = vpc_setup.create_nat_gateway(subnet_public_1)

    # Step 2: Security Groups Setup
    sg_setup = SecurityGroupSetup(aws_conn, vpc_id)
    public_sg_id = sg_setup.create_security_group(
        'PublicSG', 
        'Public Security Group', 
        [{'protocol': 'tcp', 'from_port': 22, 'to_port': 22, 'cidr_ip': '0.0.0.0/0'},
         {'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_ip': '0.0.0.0/0'},
         {'protocol': 'tcp', 'from_port': 443, 'to_port': 443, 'cidr_ip': '0.0.0.0/0'}]
    )
    
    private_sg_id = sg_setup.create_security_group(
        'PrivateSG', 
        'Private Security Group', 
        [{'protocol': 'tcp', 'from_port': 22, 'to_port': 22, 'cidr_ip': '0.0.0.0/0'},
         {'protocol': 'tcp', 'from_port': 80, 'to_port': 80, 'cidr_ip': '0.0.0.0/0'}]
    )

    # Step 3: EC2 and Load Balancer Setup
    ec2_setup = EC2InstanceSetup(aws_conn)
    user_data = """#!/bin/bash
                   sudo apt update
                   sudo apt install -y apache2
                   echo '<h1>Amit Christian</h1>' | sudo tee /var/www/html/index.html
                   sudo systemctl start apache2
                   sudo systemctl enable apache2"""
    instance_id_1 = ec2_setup.launch_instance(subnet_private_1, private_sg_id, user_data, 'Instance1')
    instance_id_2 = ec2_setup.launch_instance(subnet_private_2, private_sg_id, user_data, 'Instance2')

    lb_setup = LoadBalancerSetup(aws_conn)
    lb_arn = lb_setup.create_load_balancer([subnet_public_1, subnet_public_2], public_sg_id)
    tg_arn = lb_setup.create_target_group(vpc_id)
    lb_setup.register_targets([instance_id_1, instance_id_2])
    lb_setup.create_listener()

    # Step 4: Auto Scaling Group Setup
    asg_setup = AutoScalingSetup(aws_conn)
    launch_config_name = asg_setup.create_launch_configuration(private_sg_id, user_data)
    asg_setup.create_auto_scaling_group(launch_config_name, tg_arn, f'{subnet_private_1},{subnet_private_2}')
    asg_setup.create_scaling_policies()

    print("Deployment Completed")

    # Step 5: Clean up resources
    asg_setup.delete_auto_scaling_group()
    ec2_setup.terminate_instances()
    lb_setup.delete_load_balancer()
    sg_setup.delete_security_groups()
    vpc_setup.delete_vpc()

if __name__ == "__main__":
    main()
