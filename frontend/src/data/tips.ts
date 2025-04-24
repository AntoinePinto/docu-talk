export interface Tip {
  title: string;
  content: string;
  category: 'fact' | 'prompt' | 'concept' | 'challenge' | 'inspiration';
}

export const tips: Tip[] = [
  {
    title: "💡 Did you know?",
    content: "An AI generated a painting sold for $432,500 at an auction in 2018.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "In 2022, a generative AI co-authored a book with a human writer.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "AI models generate melodies that inspire professional musicians.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "Some AIs create unique recipes, combining unexpected flavors and culinary techniques.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "Generative programs redesign logos, creating unique identities for each brand.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "AIs adapt texts to mimic the literary style of famous authors.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "Some artists collaborate with AI to design interactive and theatrical performances.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "Generative AIs illustrate children's books.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "AIs detect fraud using models that surpass human analysis.",
    category: "fact"
  },
  {
    title: "💡 Did you know?",
    content: "Generative AI personalizes online courses, tailoring learning experiences to each student.",
    category: "fact"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Clearly define your objective to guide the AI toward a precise response.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Provide concrete examples to clarify the format or style you expect.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Use precise and specific language to avoid ambiguity in your request.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Specify the desired length, from a concise summary to a detailed report.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Indicate the output format, such as a list, table, or paragraph.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Break down complex questions into smaller requests for clearer answers.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Provide relevant context to help the AI offer a tailored solution.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Specify the tone you want, like professional, friendly, or formal.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Explain the purpose of the response to get a more targeted result.",
    category: "prompt"
  },
  {
    title: "✏️ Prompt Tip",
    content: "Test and refine your prompt until you achieve the exact result you want.",
    category: "prompt"
  },
  {
    title: "🤖 AI Concepts",
    content: "Machine Learning involves training models based on data.",
    category: "concept"
  },
  {
    title: "🤖 AI Concepts",
    content: "Deep Learning uses deep neural networks to detect complex patterns.",
    category: "concept"
  },
  {
    title: "🤖 AI Concepts",
    content: "NLP (Natural Language Processing) enables machines to understand and generate text.",
    category: "concept"
  },
  {
    title: "🤖 AI Concepts",
    content: "GANs (Generative Adversarial Networks) create original content by competing with each other.",
    category: "concept"
  },
  {
    title: "🤖 AI Concepts",
    content: "Reinforcement Learning learns through trial and error in a given environment.",
    category: "concept"
  },
  {
    title: "🎯 Current Challenges",
    content: "Reducing bias in data to ensure fairer predictions.",
    category: "challenge"
  },
  {
    title: "🎯 Current Challenges",
    content: "Ensuring transparency and explainability of AI models to build trust.",
    category: "challenge"
  },
  {
    title: "🎯 Current Challenges",
    content: "Managing the energy consumption involved in training large models.",
    category: "challenge"
  },
  {
    title: "🎯 Current Challenges",
    content: "Securing AI systems against malicious attacks or manipulation.",
    category: "challenge"
  },
  {
    title: "🎯 Current Challenges",
    content: "Maintaining ethics and accountability in AI development.",
    category: "challenge"
  },
  {
    title: "🔭 Inspirations",
    content: "“What ethical responsibilities do AI designers have regarding its societal impacts?”",
    category: "inspiration"
  },
  {
    title: "🔭 Inspirations",
    content: "“How can we prevent human biases from being reflected in algorithms and automated decisions?”",
    category: "inspiration"
  },
  {
    title: "🔭 Inspirations",
    content: "“How can we ensure that AI remains transparent and understandable to all?”",
    category: "inspiration"
  },
  {
    title: "🔭 Inspirations",
    content: "“How could AI transform the job market and influence our roles in society?”",
    category: "inspiration"
  },
  {
    title: "🔭 Inspirations",
    content: "“How far should we push machine autonomy before threatening human accountability?”",
    category: "inspiration"
  }
];
