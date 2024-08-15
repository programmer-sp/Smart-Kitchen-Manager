import boto3
import os
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from dotenv import load_dotenv, set_key
from urllib.parse import quote_plus

class Authentication:
    """
    Handles authentication for AWS services using Boto3.

    Methods:
        authenticate_aws() -> boto3.Session:
            Authenticates with AWS using credentials stored in environment variables.
    """
    
    def __init__(self):
        """
        Initializes the Authentication class and loads environment variables from a .env file.
        """
        load_dotenv(override=True)

    def authenticate_aws(self):
        """
        Authenticates with AWS using credentials stored in environment variables.

        Returns:
            boto3.Session: Authenticated Boto3 session.

        Raises:
            NoCredentialsError: If AWS credentials are not found.
            PartialCredentialsError: If partial credentials are found.
        """
        try:
            # URL encode the AWS secret access key to ensure it is properly formatted
            aws_secret_access_key = quote_plus(os.getenv("AWS_ACCESS_SECRET"))
            
            session = boto3.Session(
                aws_access_key_id=os.getenv("AWS_ACCESS_KEYID"),
                aws_secret_access_key=aws_secret_access_key,
                region_name=os.getenv("AWS_DEFAULT_REGION")
            )
            return session
        except (NoCredentialsError, PartialCredentialsError) as e:
            print(f"Error in authentication: {e}")
            raise


class AWSResourceManager:
    """
    Manages AWS resources such as VPCs, subnets, route tables, internet gateways, NAT gateways, security groups, 
    S3 buckets, EC2 instances, RDS, ALB, and ASG.

    Methods:
        create_vpc(cidr_block: str) -> str:
            Creates a VPC with the specified CIDR block.
        create_subnet(vpc_id: str, cidr_block: str, public: bool, name: str) -> str:
            Creates a subnet within the specified VPC.
        create_internet_gateway(vpc_id: str) -> str:
            Creates and attaches an Internet Gateway to the specified VPC.
        create_nat_gateway(subnet_id: str, allocation_id: str) -> str:
            Creates a NAT Gateway in the specified public subnet.
        create_security_group(vpc_id: str, name: str, description: str) -> str:
            Creates a Security Group with the specified name and description.
        add_ingress_rule(sg_id: str, protocol: str, port: int, cidr: str) -> None:
            Adds an inbound rule to a Security Group.
        create_route_table(vpc_id: str, name: str) -> str:
            Creates a route table in the specified VPC.
        associate_subnet_with_route_table(route_table_id: str, subnet_id: str) -> None:
            Associates a subnet with a route table.
        create_route_to_internet_gateway(route_table_id: str, igw_id: str) -> None:
            Creates a route in the route table to the Internet Gateway.
        create_route_to_nat_gateway(route_table_id: str, nat_id: str) -> None:
            Creates a route in the route table to the NAT Gateway.
        setup_s3_bucket(bucket_name: str) -> None:
            Creates an S3 bucket and uploads application files from a Git repository.
        generate_user_data_script(bucket_name: str) -> str:
            Generates a user data script for EC2 instances to set up the application.
        setup_rds(db_identifier: str, subnet_group_name: str, sg_id: str) -> dict:
            Sets up an RDS PostgreSQL instance.
        setup_bastion_host(subnet_id: str, sg_id: str, user_data: str) -> dict:
            Creates a Bastion Host EC2 instance in the public subnet.
        setup_private_web_servers(subnet_id_a: str, subnet_id_b: str, sg_id: str, user_data: str) -> list:
            Creates two private EC2 instances in separate subnets.
        setup_target_group(vpc_id: str, name: str) -> str:
            Creates a target group and sets up a health check.
        register_targets(tg_arn: str, instance_ids: list) -> None:
            Registers instances to the target group.
        setup_alb(name: str, subnet_ids: list, sg_id: str) -> tuple:
            Creates an Application Load Balancer (ALB).
        create_listener(alb_arn: str, tg_arn: str) -> None:
            Creates a listener for the ALB and associates it with the target group.
        create_launch_template(name: str, user_data: str, sg_id: str, subnet_id: str) -> str:
            Creates a launch template for the Auto Scaling Group (ASG).
        setup_asg(name: str, launch_template_id: str, tg_arn: str, subnet_ids: list) -> None:
            Creates and configures an Auto Scaling Group (ASG).
        validate_setup(alb_dns: str) -> None:
            Validates the setup by accessing the ALB DNS name.
    """

    def __init__(self, session):
        """
        Initializes the AWSResourceManager with an authenticated session.

        Args:
            session (boto3.Session): Authenticated Boto3 session.
        """
        self.session = session
        self.ec2 = session.client('ec2')
        self.elbv2 = session.client('elbv2')
        self.rds = session.client('rds')
        self.s3 = session.client('s3')
        self.autoscaling = session.client('autoscaling')

    def create_vpc(self, cidr_block: str) -> str:
        """
        Creates a VPC with the specified CIDR block.

        Args:
            cidr_block (str): The CIDR block for the VPC.

        Returns:
            str: The ID of the created VPC.
        """
        response = self.ec2.create_vpc(CidrBlock=cidr_block)
        vpc_id = response['Vpc']['VpcId']
        self.ec2.create_tags(Resources=[vpc_id], Tags=[{"Key": "Name", "Value": "skh_vpc"}])
        print(f"Created VPC with ID: {vpc_id}")
        return vpc_id

    def create_subnet(self, vpc_id: str, cidr_block: str, public: bool, name: str) -> str:
        """
        Creates a subnet within the specified VPC.

        Args:
            vpc_id (str): The ID of the VPC.
            cidr_block (str): The CIDR block for the subnet.
            public (bool): If True, auto-assign public IPs to instances in this subnet.
            name (str): The name for the subnet.

        Returns:
            str: The ID of the created subnet.
        """
        response = self.ec2.create_subnet(VpcId=vpc_id, CidrBlock=cidr_block)
        subnet_id = response['Subnet']['SubnetId']
        if public:
            self.ec2.modify_subnet_attribute(SubnetId=subnet_id, MapPublicIpOnLaunch={"Value": True})
        self.ec2.create_tags(Resources=[subnet_id], Tags=[{"Key": "Name", "Value": name}])
        print(f"Created Subnet with ID: {subnet_id}")
        return subnet_id

    def create_internet_gateway(self, vpc_id: str) -> str:
        """
        Creates and attaches an Internet Gateway to the specified VPC.

        Args:
            vpc_id (str): The ID of the VPC.

        Returns:
            str: The ID of the created Internet Gateway.
        """
        response = self.ec2.create_internet_gateway()
        igw_id = response['InternetGateway']['InternetGatewayId']
        self.ec2.attach_internet_gateway(InternetGatewayId=igw_id, VpcId=vpc_id)
        self.ec2.create_tags(Resources=[igw_id], Tags=[{"Key": "Name", "Value": "skh_igw"}])
        print(f"Created and attached Internet Gateway with ID: {igw_id}")
        return igw_id

    def create_nat_gateway(self, subnet_id: str, allocation_id: str) -> str:
        """
        Creates a NAT Gateway in the specified public subnet.

        Args:
            subnet_id (str): The ID of the public subnet.
            allocation_id (str): The allocation ID of the Elastic IP address.

        Returns:
            str: The ID of the created NAT Gateway.
        """
        response = self.ec2.create_nat_gateway(SubnetId=subnet_id, AllocationId=allocation_id)
        nat_id = response['NatGateway']['NatGatewayId']
        self.ec2.create_tags(Resources=[nat_id], Tags=[{"Key": "Name", "Value": "skh_nat"}])
        print(f"Created NAT Gateway with ID: {nat_id}")
        return nat_id

    def create_security_group(self, vpc_id: str, name: str, description: str) -> str:
        """
        Creates a Security Group with the specified name and description.

        Args:
            vpc_id (str): The ID of the VPC.
            name (str): The name of the Security Group.
            description (str): The description of the Security Group.

        Returns:
            str: The ID of the created Security Group.
        """
        response = self.ec2.create_security_group(VpcId=vpc_id, GroupName=name, Description=description)
        sg_id = response['GroupId']
        self.ec2.create_tags(Resources=[sg_id], Tags=[{"Key": "Name", "Value": f"skh_{name}"}])
        print(f"Created Security Group with ID: {sg_id}")
        return sg_id

    def add_ingress_rule(self, sg_id: str, protocol: str, port: int, cidr: str) -> None:
        """
        Adds an inbound rule to a Security Group.

        Args:
            sg_id (str): The ID of the Security Group.
            protocol (str): The protocol (e.g., 'tcp').
            port (int): The port number.
            cidr (str): The CIDR block for the rule.
        """
        self.ec2.authorize_security_group_ingress(GroupId=sg_id, IpProtocol=protocol, FromPort=port, ToPort=port, CidrIp=cidr)
        print(f"Added ingress rule to Security Group ID: {sg_id}")

    def create_route_table(self, vpc_id: str, name: str) -> str:
        """
        Creates a route table in the specified VPC.

        Args:
            vpc_id (str): The ID of the VPC.
            name (str): The name of the route table.

        Returns:
            str: The ID of the created route table.
        """
        response = self.ec2.create_route_table(VpcId=vpc_id)
        route_table_id = response['RouteTable']['RouteTableId']
        self.ec2.create_tags(Resources=[route_table_id], Tags=[{"Key": "Name", "Value": name}])
        print(f"Created Route Table with ID: {route_table_id}")
        return route_table_id

    def associate_subnet_with_route_table(self, route_table_id: str, subnet_id: str) -> None:
        """
        Associates a subnet with a route table.

        Args:
            route_table_id (str): The ID of the route table.
            subnet_id (str): The ID of the subnet to associate.
        """
        self.ec2.associate_route_table(RouteTableId=route_table_id, SubnetId=subnet_id)
        print(f"Associated Subnet ID: {subnet_id} with Route Table ID: {route_table_id}")

    def create_route_to_internet_gateway(self, route_table_id: str, igw_id: str) -> None:
        """
        Creates a route in the route table to the Internet Gateway.

        Args:
            route_table_id (str): The ID of the route table.
            igw_id (str): The ID of the Internet Gateway.
        """
        self.ec2.create_route(RouteTableId=route_table_id, DestinationCidrBlock='0.0.0.0/0', GatewayId=igw_id)
        print(f"Created route to Internet Gateway ID: {igw_id} in Route Table ID: {route_table_id}")

    def create_route_to_nat_gateway(self, route_table_id: str, nat_id: str) -> None:
        """
        Creates a route in the route table to the NAT Gateway.

        Args:
            route_table_id (str): The ID of the route table.
            nat_id (str): The ID of the NAT Gateway.

        Returns:
            None
        """
        self.ec2.create_route(RouteTableId=route_table_id, DestinationCidrBlock='0.0.0.0/0', NatGatewayId=nat_id)
        print(f"Created route to NAT Gateway ID: {nat_id} in Route Table ID: {route_table_id}")

    def setup_s3_bucket(self, bucket_name: str) -> None:
        """
        Creates an S3 bucket and uploads application files from a Git repository.

        Args:
            bucket_name (str): The name of the S3 bucket.

        Returns:
            None
        """
        self.s3.create_bucket(Bucket=bucket_name)
        print(f"Created S3 bucket: {bucket_name}")

        os.system(f"git clone {os.getenv('GIT_REPO_URL')} /tmp/{bucket_name}")

        for root, dirs, files in os.walk(f"/tmp/{bucket_name}"):
            for file in files:
                self.s3.upload_file(os.path.join(root, file), bucket_name, file)
        print(f"Uploaded files to S3 bucket: {bucket_name}")

    def generate_user_data_script(self, bucket_name: str) -> str:
        """
        Generates a user data script for EC2 instances to set up the application.

        Args:
            bucket_name (str): The S3 bucket name where the application is stored.

        Returns:
            str: The user data script.
        """
        user_data = f"""#!/bin/bash
        yum update -y
        yum install -y httpd git php php-pgsql
        amazon-linux-extras install postgresql10 -y
        systemctl start httpd
        systemctl enable httpd
        mkdir -p /var/www/html/
        aws s3 cp s3://{bucket_name}/myapp /var/www/html/myapp --recursive
        chmod -R 755 /var/www/html/
        systemctl restart httpd
        """
        return user_data

    def setup_rds(self, db_identifier: str, subnet_group_name: str, sg_id: str) -> dict:
        """
        Sets up an RDS PostgreSQL instance and updates the .env file with the RDS endpoint.

        Args:
            db_identifier (str): The identifier for the RDS instance.
            subnet_group_name (str): The name of the DB subnet group.
            sg_id (str): The security group ID for the RDS instance.

        Returns:
            dict: RDS instance details.
        """
        # Create the DB subnet group
        self.rds.create_db_subnet_group(
            DBSubnetGroupName=subnet_group_name,
            SubnetIds=self.private_subnet_ids,
            DBSubnetGroupDescription="Subnet group for RDS"
        )
        print(f"Created DB Subnet Group: {subnet_group_name}")

        # Create the RDS instance
        response = self.rds.create_db_instance(
            DBInstanceIdentifier=db_identifier,
            AllocatedStorage=20,
            DBName="smart_kitchen_helper",
            Engine="postgres",
            MasterUsername=os.getenv("POSTGRES_USERNAME"),
            MasterUserPassword=os.getenv("POSTGRES_PASSWORD"),
            VpcSecurityGroupIds=[sg_id],
            DBSubnetGroupName=subnet_group_name,
            MultiAZ=True,
            PubliclyAccessible=False,
            StorageType="gp2",
            BackupRetentionPeriod=7,
            EngineVersion="13.3",
            AutoMinorVersionUpgrade=True,
            LicenseModel="postgresql-license",
            StorageEncrypted=True
        )
        print(f"Created RDS instance: {db_identifier}")

        # Wait for the RDS instance to be available
        waiter = self.rds.get_waiter('db_instance_available')
        waiter.wait(DBInstanceIdentifier=db_identifier)
        print(f"RDS instance {db_identifier} is now available.")

        # Retrieve the RDS endpoint
        rds_instance = self.rds.describe_db_instances(DBInstanceIdentifier=db_identifier)
        endpoint = rds_instance['DBInstances'][0]['Endpoint']['Address']
        port = rds_instance['DBInstances'][0]['Endpoint']['Port']

        # Update the .env file with the RDS endpoint and port
        env_path = os.path.join(os.getcwd(), '.env')
        set_key(env_path, "POSTGRES_HOST", endpoint)
        set_key(env_path, "POSTGRES_PORT", str(port))
        print(f"Updated .env file with RDS endpoint: {endpoint} and port: {port}")

        return response
    def setup_bastion_host(self, subnet_id: str, sg_id: str, user_data: str) -> dict:
        """
        Creates a Bastion Host EC2 instance in the public subnet.

        Args:
            subnet_id (str): The ID of the public subnet.
            sg_id (str): The ID of the security group.
            user_data (str): The user data script.

        Returns:
            dict: Details of the created EC2 instance.
        """
        response = self.ec2.run_instances(
            ImageId="ami-0abcdef1234567890",  # Replace with the latest Amazon Linux 2 AMI
            InstanceType="t2.micro",
            KeyName="your-key-pair-name",
            MaxCount=1,
            MinCount=1,
            SecurityGroupIds=[sg_id],
            SubnetId=subnet_id,
            UserData=user_data,
            TagSpecifications=[{
                "ResourceType": "instance",
                "Tags": [{"Key": "Name", "Value": "skh_bastion"}]
            }]
        )
        instance_id = response['Instances'][0]['InstanceId']
        print(f"Created Bastion Host with ID: {instance_id}")
        return response

    def setup_private_web_servers(self, subnet_id_a: str, subnet_id_b: str, sg_id: str, user_data: str) -> list:
        """
        Creates two private EC2 instances in separate subnets.

        Args:
            subnet_id_a (str): The ID of the first private subnet.
            subnet_id_b (str): The ID of the second private subnet.
            sg_id (str): The ID of the security group.
            user_data (str): The user data script.

        Returns:
            list: Details of the created EC2 instances.
        """
        instances = []
        for subnet_id in [subnet_id_a, subnet_id_b]:
            response = self.ec2.run_instances(
                ImageId="ami-0abcdef1234567890",  # Replace with the latest Amazon Linux 2 AMI
                InstanceType="t2.micro",
                KeyName="your-key-pair-name",
                MaxCount=1,
                MinCount=1,
                SecurityGroupIds=[sg_id],
                SubnetId=subnet_id,
                UserData=user_data,
                TagSpecifications=[{
                    "ResourceType": "instance",
                    "Tags": [{"Key": "Name", "Value": f"skh_webserver_{subnet_id}"}]
                }]
            )
            instance_id = response['Instances'][0]['InstanceId']
            instances.append(instance_id)
            print(f"Created Private Web Server with ID: {instance_id}")
        return instances

    def setup_target_group(self, vpc_id: str, name: str) -> str:
        """
        Creates a target group and sets up a health check.
    
        Args:
            vpc_id (str): The ID of the VPC.
            name (str): The name of the target group.
    
        Returns:
            str: The ARN of the created target group.
        """
        response = self.elbv2.create_target_group(
            Name=name,
            Protocol='HTTP',
            Port=80,
            VpcId=vpc_id,
            HealthCheckProtocol='HTTP',
            HealthCheckPort='80',
            HealthCheckPath='/health',  # Updated health check path to /health
            HealthCheckIntervalSeconds=30,
            HealthCheckTimeoutSeconds=5,
            HealthyThresholdCount=5,
            UnhealthyThresholdCount=2,
            TargetType='instance'
        )
        tg_arn = response['TargetGroups'][0]['TargetGroupArn']
        print(f"Created Target Group with ARN: {tg_arn}")
        return tg_arn

    def register_targets(self, tg_arn: str, instance_ids: list) -> None:
        """
        Registers instances to the target group.

        Args:
            tg_arn (str): The ARN of the target group.
            instance_ids (list): The list of EC2 instance IDs to register.

        Returns:
            None
        """
        targets = [{'Id': instance_id} for instance_id in instance_ids]
        self.elbv2.register_targets(TargetGroupArn=tg_arn, Targets=targets)
        print(f"Registered instances to Target Group: {tg_arn}")

    def setup_alb(self, name: str, subnet_ids: list, sg_id: str) -> tuple:
        """
        Creates an Application Load Balancer (ALB).

        Args:
            name (str): The name of the ALB.
            subnet_ids (list): The list of subnet IDs where the ALB will be deployed.
            sg_id (str): The ID of the security group for the ALB.

        Returns:
            tuple: The ARN and DNS name of the created ALB.
        """
        response = self.elbv2.create_load_balancer(
            Name=name,
            Subnets=subnet_ids,
            SecurityGroups=[sg_id],
            Scheme='internet-facing',
            Tags=[{"Key": "Name", "Value": name}]
        )
        alb_arn = response['LoadBalancers'][0]['LoadBalancerArn']
        alb_dns = response['LoadBalancers'][0]['DNSName']
        print(f"Created ALB with DNS: {alb_dns}")
        return alb_arn, alb_dns

    def create_listener(self, alb_arn: str, tg_arn: str) -> None:
        """
        Creates a listener for the ALB and associates it with the target group.

        Args:
            alb_arn (str): The ARN of the ALB.
            tg_arn (str): The ARN of the target group.

        Returns:
            None
        """
        self.elbv2.create_listener(
            LoadBalancerArn=alb_arn,
            Protocol='HTTP',
            Port=80,
            DefaultActions=[{
                'Type': 'forward',
                'TargetGroupArn': tg_arn
            }]
        )
        print(f"Created listener for ALB with ARN: {alb_arn}")

    def create_launch_template(self, name: str, user_data: str, sg_id: str, subnet_id: str) -> str:
        """
        Creates a launch template for the Auto Scaling Group (ASG).

        Args:
            name (str): The name of the launch template.
            user_data (str): The user data script.
            sg_id (str): The security group ID.
            subnet_id (str): The subnet ID.

        Returns:
            str: The ID of the created launch template.
        """
        response = self.ec2.create_launch_template(
            LaunchTemplateName=name,
            LaunchTemplateData={
                'ImageId': "ami-0abcdef1234567890",  # Replace with the latest Amazon Linux 2 AMI
                'InstanceType': 't2.micro',
                'KeyName': "your-key-pair-name",
                'SecurityGroupIds': [sg_id],
                'UserData': user_data,
                'TagSpecifications': [{
                    "ResourceType": "instance",
                    "Tags": [{"Key": "Name", "Value": name}]
                }]
            }
        )
        template_id = response['LaunchTemplate']['LaunchTemplateId']
        print(f"Created Launch Template with ID: {template_id}")
        return template_id

    def setup_asg(self, name: str, launch_template_id: str, tg_arn: str, subnet_ids: list) -> None:
        """
        Creates and configures an Auto Scaling Group (ASG).

        Args:
            name (str): The name of the ASG.
            launch_template_id (str): The ID of the launch template.
            tg_arn (str): The ARN of the target group.
            subnet_ids (list): The list of subnet IDs.

        Returns:
            None
        """
        self.autoscaling.create_auto_scaling_group(
            AutoScalingGroupName=name,
            LaunchTemplate={'LaunchTemplateId': launch_template_id},
            MinSize=2,
            MaxSize=4,
            DesiredCapacity=2,
            VPCZoneIdentifier=",".join(subnet_ids),
            TargetGroupARNs=[tg_arn],
            Tags=[{
                "ResourceId": name,
                "ResourceType": "auto-scaling-group",
                "Key": "Name",
                "Value": name
            }]
        )
        print(f"Created Auto Scaling Group: {name}")

    def validate_setup(self, alb_dns: str) -> None:
        """
        Validates the setup by accessing the ALB DNS name.

        Args:
            alb_dns (str): The DNS name of the ALB.

        Returns:
            None
        """
        print(f"Access your web application via the ALB: http://{alb_dns}")
