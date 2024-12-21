import Stripe from 'stripe'; // ES6 import
const stripe = new Stripe('sk_test_51NEaTAByqae66O7NwklX2PO1fsJOrYIP1VjKogAIUeoT9ghXqHYrRd9qjE4uamChzQPlu3oSi19GgZxc32uScTAC00v9hPMj94'); // Initialize Stripe

(async () => {
    try {
        // Create the product
        const product = await stripe.products.create({
            name: 'Starter Subscription',
            description: '$12/Month subscription',
        });

        // Create the price
        const price = await stripe.prices.create({
            unit_amount: 1200,
            currency: 'usd',
            recurring: {
                interval: 'month',
            },
            product: product.id,
        });

        // Log the success messages
        console.log(`Success! Here is your starter subscription product id: ${product.id}`);
        console.log(`Success! Here is your starter subscription price id: ${price.id}`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
