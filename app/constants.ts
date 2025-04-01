
export const getHost = () => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
        return `http://${process.env.NEXT_PUBLIC_DEV_BACKEND_URL}`;

    } else if (process.env.NEXT_PUBLIC_ENV === 'production') {
        return `https://${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}`;

    } else {
        console.log('Unknown environment detected');
        throw new Error('Unknown environment detected');
    }
}