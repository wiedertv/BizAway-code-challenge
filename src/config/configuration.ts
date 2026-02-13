export default () => ({
    PORT: parseInt(process.env.PORT || '3000', 10),
    TRIPS_API_KEY: process.env.TRIPS_API_KEY,
    TRIPS_API_BASE_URL: process.env.TRIPS_API_BASE_URL,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/trip-planner',
    USE_IN_MEMORY_DB: process.env.USE_IN_MEMORY_DB === 'true',
})