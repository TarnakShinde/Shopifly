// File: lib/chatbot.js
import * as tf from "@tensorflow/tfjs-node";
import { WordTokenizer } from "natural";
import { PorterStemmer } from "natural";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced ecommerce intents

const defaultIntents = {
    intents: [
        {
            tag: "greeting",
            patterns: ["Hi", "Hey", "Hello", "Good day", "What's up"],
            responses: [
                "Hi there! Welcome to Shopifly 😊",
                "Hello! How can I assist you today?",
                "Hey! Looking for something specific?",
                "Hi! Let me know how I can help!",
            ],
        },
        {
            tag: "goodbye",
            patterns: ["Bye", "See you", "Goodbye", "Catch you later"],
            responses: [
                "Goodbye! Thanks for visiting Shopifly!",
                "See you soon! Have a great day!",
                "Bye! Come back anytime 😊",
            ],
        },
        {
            tag: "thanks",
            patterns: [
                "Thanks",
                "Thank you",
                "Thanks a lot",
                "I appreciate it",
            ],
            responses: [
                "You're welcome! Always happy to help 😊",
                "No problem at all!",
                "My pleasure! Let us know if you need more help.",
            ],
        },
        {
            tag: "products",
            patterns: [
                "What do you sell?",
                "What products are available?",
                "What items can I buy?",
                "Tell me about your products",
            ],
            responses: [
                "We have a wide range of products, including clothing, shoes, and accessories for everyone!",
                "You'll find everything from fashion items to gadgets here at Shopifly!",
                "Explore our collection of trendy clothing, footwear, and much more!",
            ],
        },
        {
            tag: "payments",
            patterns: [
                "What payment methods do you accept?",
                "Can I use PayPal?",
                "Do you take credit cards?",
                "How can I pay?",
            ],
            responses: [
                "We accept credit/debit cards, PayPal, and other secure payment methods.",
                "You can pay using Mastercard, VISA, or PayPal easily.",
                "We support most major payment methods for your convenience!",
            ],
        },
        {
            tag: "shipping",
            patterns: [
                "How long is delivery?",
                "When will I get my order?",
                "How fast is shipping?",
                "Do you offer fast delivery?",
            ],
            responses: [
                "Our delivery takes 2-4 days for most locations.",
                "We ship your items quickly, and you can expect them within 2-4 days!",
                "Shipping is fast and reliable—2 to 4 days delivery time.",
            ],
        },
        {
            tag: "return_policy",
            patterns: [
                "What is your return policy?",
                "Can I return items?",
                "How do returns work?",
                "Is there a refund option?",
            ],
            responses: [
                "You can return items within 30 days for a full refund.",
                "Our return policy allows hassle-free returns within 30 days.",
                "If you're not happy with your order, return it within 30 days!",
            ],
        },
        {
            tag: "funny",
            patterns: [
                "Tell me a joke!",
                "Make me laugh!",
                "Say something funny!",
            ],
            responses: [
                "Why don't skeletons fight each other? They don't have the guts!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "I bought a belt made of watches... it was a waist of time!",
            ],
        },
        {
            tag: "discount",
            patterns: [
                "Any discounts?",
                "Do you have promo codes?",
                "Any ongoing sales?",
                "How can I get a discount?",
                "Any offers today?",
            ],
            responses: [
                "We have ongoing seasonal discounts! Use code WELCOME10 for 10% off your first order!",
                "Check our promotions page for the latest deals and discounts!",
                "Sign up for our newsletter to receive exclusive discount codes!",
            ],
        },
        {
            tag: "track_order",
            patterns: [
                "Where is my order?",
                "How to track my package?",
                "Track my order",
                "Order status",
                "Package tracking",
            ],
            responses: [
                "You can track your order by visiting the 'My Orders' section and clicking on 'Track'.",
                "Check your order status in your account dashboard under 'My Orders'.",
                "We've sent tracking information to your email when your order shipped!",
            ],
        },
        {
            tag: "sizes",
            patterns: [
                "Do you have size guides?",
                "How do I find my size?",
                "Are sizes true to fit?",
                "Size chart",
            ],
            responses: [
                "You'll find detailed size guides on each product page!",
                "Our size charts can help you find the perfect fit - check the product description!",
                "We provide measurement guides for all clothing items to ensure the best fit!",
            ],
        },
        {
            tag: "customer_service",
            patterns: [
                "Speak to a human",
                "Connect with agent",
                "Talk to customer service",
                "Need help from a person",
                "Real person",
            ],
            responses: [
                "Our customer service team is available from 9 AM to 6 PM EST. Would you like me to connect you?",
                "I'll transfer you to one of our customer service representatives right away.",
                "Our team is standing by to help you! Let me connect you with a representative.",
            ],
        },
        {
            tag: "product_recommendation",
            patterns: [
                "What do you recommend?",
                "Best sellers?",
                "Popular items",
                "What's trending?",
                "Recommend something",
            ],
            responses: [
                "Our current best-sellers include our premium jeans and graphic tees!",
                "Customers are loving our new spring collection, especially the casual dresses!",
                "I'd recommend checking out our 'Featured Products' section for trending items!",
            ],
        },
        {
            tag: "store_location",
            patterns: [
                "Physical store",
                "Store locations",
                "Where are your shops?",
                "Do you have retail stores?",
            ],
            responses: [
                "We're primarily an online store, but we have physical locations in New York, Los Angeles, and Chicago!",
                "Check our 'Store Locator' page to find the nearest Shopifly store to you!",
                "We have flagship stores in major cities across the country. Visit our website for specific locations!",
            ],
        },
    ],
};

// Create tokenizer
const tokenizer = new WordTokenizer();

// Preprocessing function
function preprocessInput(input) {
    // Convert to lowercase and tokenize
    const tokens = tokenizer.tokenize(input.toLowerCase()) || [];

    // Stem each token
    return tokens.map((token) => PorterStemmer.stem(token));
}

// Create training data
function createTrainingData(intentsData) {
    const documents = [];
    const classes = [];

    // Extract all unique tags/classes
    intentsData.intents.forEach((intent) => {
        if (!classes.includes(intent.tag)) {
            classes.push(intent.tag);
        }

        // Add each pattern to documents with its associated tag
        intent.patterns.forEach((pattern) => {
            const processedPattern = preprocessInput(pattern);
            documents.push({ words: processedPattern, intent: intent.tag });
        });
    });

    // Create our bag of words
    const allWords = [];
    documents.forEach((doc) => {
        allWords.push(...doc.words);
    });

    // Remove duplicates and sort
    const vocabulary = [...new Set(allWords)].sort();

    return { documents, classes, vocabulary };
}

// Convert a sentence to a bag of words
function sentenceToBow(sentence, vocabulary) {
    const processedSentence = preprocessInput(sentence);
    const bow = Array(vocabulary.length).fill(0);

    processedSentence.forEach((word) => {
        const index = vocabulary.indexOf(word);
        if (index > -1) {
            bow[index] = 1;
        }
    });

    return bow;
}

// Create and train the model
async function trainChatbot(intentsData = defaultIntents) {
    const { documents, classes, vocabulary } = createTrainingData(intentsData);

    // Prepare training data
    const trainingData = [];
    const outputData = [];

    documents.forEach((doc) => {
        // Create bow representation
        const bagOfWords = sentenceToBow(doc.words.join(" "), vocabulary);
        trainingData.push(bagOfWords);

        // Create output array (one-hot encoding)
        const outputRow = Array(classes.length).fill(0);
        outputRow[classes.indexOf(doc.intent)] = 1;
        outputData.push(outputRow);
    });

    // Convert to tensors
    const trainX = tf.tensor2d(trainingData);
    const trainY = tf.tensor2d(outputData);

    // Build model
    const model = tf.sequential();
    model.add(
        tf.layers.dense({
            inputShape: [vocabulary.length],
            units: 128,
            activation: "relu",
        })
    );
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(
        tf.layers.dense({
            units: 64,
            activation: "relu",
        })
    );
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(
        tf.layers.dense({
            units: classes.length,
            activation: "softmax",
        })
    );

    // Compile model
    model.compile({
        optimizer: "adam",
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });

    // Train model
    await model.fit(trainX, trainY, {
        epochs: 200,
        batchSize: 8,
        verbose: 1,
    });

    // Save the model info to Supabase
    const modelInfo = {
        classes: classes,
        vocabulary: vocabulary,
        created_at: new Date().toISOString(),
    };

    try {
        const { error } = await supabase
            .from("chatbot_models")
            .insert([modelInfo]);

        if (error) {
            console.error("Error saving model info to Supabase:", error);
        } else {
            console.log("Model info saved to Supabase");
        }
    } catch (err) {
        console.error("Failed to save model info:", err);
    }

    // Save model layers as JSON to Supabase storage
    try {
        const modelJSON = model.toJSON();
        const { error } = await supabase.storage
            .from("chatbot")
            .upload("latest_model.json", JSON.stringify(modelJSON), {
                contentType: "application/json",
                upsert: true,
            });

        if (error) {
            console.error("Error saving model to Supabase storage:", error);
        } else {
            console.log("Model saved to Supabase storage");
        }
    } catch (err) {
        console.error("Failed to save model:", err);
    }

    return { model, classes, vocabulary };
}

// Predict function
async function predictResponse(model, input, classes, vocabulary) {
    const bow = sentenceToBow(input, vocabulary);
    const inputTensor = tf.tensor2d([bow]);

    const prediction = await model.predict(inputTensor).array();

    // Get highest probability
    const results = prediction[0];
    const maxValue = Math.max(...results);
    const maxIndex = results.indexOf(maxValue);

    // Check confidence threshold
    if (maxValue < 0.6) {
        return { tag: "fallback", confidence: maxValue };
    }

    return { tag: classes[maxIndex], confidence: maxValue };
}

// Get random response from intent
function getResponse(tag, intentsData = defaultIntents) {
    const intent = intentsData.intents.find((intent) => intent.tag === tag);

    if (intent) {
        const responses = intent.responses;
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    // Fallback response
    return "I'm not sure I understand. Could you try rephrasing that?";
}

// Log conversation to Supabase
async function logConversation(message, response, intent, confidence, userId) {
    try {
        const { error } = await supabase.from("chatbot_conversations").insert([
            {
                user_id: userId || "anonymous",
                user_message: message,
                bot_response: response,
                intent: intent,
                confidence: confidence,
                timestamp: new Date().toISOString(),
            },
        ]);

        if (error) {
            console.error("Error logging conversation to Supabase:", error);
        }
    } catch (err) {
        console.error("Failed to log conversation:", err);
    }
}

// Process message function (for API route)
async function processMessage(
    message,
    model,
    classes,
    vocabulary,
    intentsData = defaultIntents,
    userId
) {
    if (message.toLowerCase() === "quit") {
        return {
            text: "Goodbye! Thanks for visiting Shopifly!",
            intent: "goodbye",
            confidence: 1.0,
            end: true,
        };
    }

    const prediction = await predictResponse(
        model,
        message,
        classes,
        vocabulary
    );
    const response = getResponse(prediction.tag, intentsData);

    // Log conversation to Supabase
    await logConversation(
        message,
        response,
        prediction.tag,
        prediction.confidence,
        userId
    );

    return {
        text: response,
        intent: prediction.tag,
        confidence: prediction.confidence,
        end: false,
    };
}

// Initialize chatbot function
async function initChatbot() {
    // Try to load model info from Supabase
    let modelInfo = null;
    let model = null;

    try {
        // Get latest model info
        const { data, error } = await supabase
            .from("chatbot_models")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Error loading model info from Supabase:", error);
        } else if (data && data.length > 0) {
            modelInfo = data[0];

            // Try to load model from storage
            const { data: modelData, error: modelError } =
                await supabase.storage
                    .from("chatbot")
                    .download("latest_model.json");

            if (modelError) {
                console.error(
                    "Error loading model from Supabase storage:",
                    modelError
                );
            } else {
                const modelJSON = await modelData.text();
                model = await tf.models.modelFromJSON(JSON.parse(modelJSON));
                console.log("Model loaded from Supabase storage");
            }
        }
    } catch (err) {
        console.error("Failed to load model:", err);
    }

    // If no model found or error loading, train a new one
    if (!model || !modelInfo) {
        console.log("No model found or error loading, training new model...");
        const trainingResult = await trainChatbot();
        model = trainingResult.model;
        modelInfo = {
            classes: trainingResult.classes,
            vocabulary: trainingResult.vocabulary,
        };
    }

    return {
        model,
        classes: modelInfo.classes,
        vocabulary: modelInfo.vocabulary,
        processMessage: (message, userId) =>
            processMessage(
                message,
                model,
                modelInfo.classes,
                modelInfo.vocabulary,
                defaultIntents,
                userId
            ),
    };
}

export { initChatbot, trainChatbot, processMessage, defaultIntents };
