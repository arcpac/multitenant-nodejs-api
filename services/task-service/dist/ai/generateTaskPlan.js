import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
const generateTaskPlanInputSchema = z.object({
    goal: z.string().trim().min(3).max(500),
});
const generatedTaskPlanSchema = z.object({
    tasks: z.array(z.object({
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).nullable(),
    })).min(3).max(7),
});
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
    }
    return new OpenAI({ apiKey });
}
export async function generateTaskPlan(goal) {
    const { goal: cleanGoal } = generateTaskPlanInputSchema.parse({ goal });
    console.log('cleanGoal: ', cleanGoal);
    const openai = getOpenAIClient();
    const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";
    const response = await openai.responses.parse({
        model,
        input: [
            {
                role: "system",
                content: "You break a user goal into a short list of concrete tasks. Return only actionable tasks. Do not invent people, teams, dates, or dependencies. Keep tasks concise and ordered.",
            },
            {
                role: "user",
                content: `Create a task plan for this goal: ${cleanGoal}`,
            },
        ],
        text: {
            format: zodTextFormat(generatedTaskPlanSchema, "task_plan"),
        },
    });
    console.log('response: ', response);
    if (!response.output_parsed) {
        throw new Error("OpenAI returned no parsed task plan");
    }
    return response.output_parsed;
}
