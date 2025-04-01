
export const getHost = () => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
        return `http://${process.env.NEXT_PUBLIC_DEV_BACKEND_URL}`;

    } else if (process.env.NEXT_PUBLIC_ENV === 'production') {
        return `https://${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}`;

    } else if (process.env.NEXT_PUBLIC_ENV === 'preview') {
        return `https://${process.env.NEXT_PUBLIC_STAGING_BACKEND_URL}`;

    } else {
        console.log(process.env.NEXT_PUBLIC_NODE_ENV);
        throw new Error('Invalid environment variable. Please set NEXT_PUBLIC_ENV to either development, production, or staging.');
    }
}