import paypal from 'paypal-rest-sdk';
import config from '../config';

const mode = config.PAYPAL_MODE;
const client_id = config.PAYPAL_CLIENT_ID;
const client_secret = config.PAYPAL_SECRET_ID;

paypal.configure({
    mode: mode,
    client_id: client_id,
    client_secret: client_secret,
});

export default paypal;