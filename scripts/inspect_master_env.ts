console.log('🔍 INSPECTING ENVIRONMENT VARIABLES...\n')

const dbUrl = process.env.DATABASE_URL || 'NOT SET'
const directUrl = process.env.DIRECT_URL || 'NOT SET'

console.log('DATABASE_URL:', dbUrl.replace(/:([^:@]+)@/, ':****@'))
console.log('DIRECT_URL:', directUrl.replace(/:([^:@]+)@/, ':****@'))
