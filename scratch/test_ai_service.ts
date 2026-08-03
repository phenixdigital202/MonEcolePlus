import { generateSchoolAIAnalysis } from "../lib/ai-service"

async function test() {
  try {
    console.log("Starting AI analysis test...")
    const result = await generateSchoolAIAnalysis()
    console.log("Analysis generated successfully:")
    console.log(JSON.stringify(result, null, 2))
  } catch (err: any) {
    console.error("AI analysis failed with error:")
    console.error(err)
  }
}

test()
