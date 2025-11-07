import amqp from "amqplib";
import { log } from "console";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {

        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port:5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
        });

        channel = await connection.createChannel();
        console.log("Connected to RabbitMQ");
        

    } catch (error) {
        console.error("❌ Failed to connect to Rabbitmq", error);
    }
}

export const publishToQueue = async(queueName:string,message:any) => {
    if(!channel){
        console.error("Rabbitmq channel is not initialised");
        return;
    }

    await channel.assertQueue(queueName,{durable:true});

    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{
        persistent: true
    });
}

export const invalidateCacheJob = async (cacheKey: string[]) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKey
        };

        await publishToQueue("cache-invalidation",message);
        console.log("Cache invalidation job published to rabbitMQ");
        
    } catch (error) {
        console.error("Failed to publish cache on rabbitMQ",error);
    }
};

