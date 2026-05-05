import type { TaskProvider } from "./types.js";

/**
 * Each entry maps a keyword pattern to subtask lists at five detail levels
 * (index 0 = temperature 1, index 4 = temperature 5).
 */
interface SubtaskTemplate {
  pattern: RegExp;
  levels: [string[], string[], string[], string[], string[]];
}

const TEMPLATES: SubtaskTemplate[] = [
  {
    pattern: /dog\s*house|kennel/i,
    levels: [
      ["Buy materials", "Construct it"],
      ["Plan the design", "Buy materials", "Build the structure", "Finish and paint"],
      [
        "Sketch a design and measure the dog",
        "Create a materials list",
        "Buy lumber, nails, and paint",
        "Cut wood to size",
        "Assemble walls, floor, and roof",
        "Sand and paint the finished house",
      ],
      [
        "Measure the dog and determine dimensions",
        "Sketch the design with dimensions",
        "Create a detailed materials list",
        "Purchase lumber and hardware",
        "Purchase paint and weather sealant",
        "Cut all wood pieces to size",
        "Assemble the floor frame",
        "Attach walls to the floor",
        "Build and attach the roof",
        "Sand all surfaces",
        "Apply weather sealant",
        "Apply paint or stain",
      ],
      [
        "Research appropriate kennel dimensions for the breed",
        "Sketch a scaled design with measurements",
        "List all required materials (lumber, screws, hinges, paint)",
        "Estimate costs and set a budget",
        "Source and purchase lumber",
        "Source and purchase fasteners and hardware",
        "Source and purchase paint and sealant",
        "Set up a safe workspace",
        "Cut floor panel and frame pieces",
        "Assemble the floor frame and attach decking",
        "Cut and assemble front wall with door opening",
        "Cut and assemble back wall",
        "Cut and assemble side walls",
        "Attach walls together and to the floor",
        "Cut and assemble roof panels",
        "Attach roof structure to walls",
        "Check for sharp edges and sand all surfaces",
        "Apply primer coat",
        "Apply weather sealant",
        "Apply final paint or stain coat",
        "Inspect finished structure for safety",
      ],
    ],
  },
  {
    pattern: /webs?ite|web\s*app/i,
    levels: [
      ["Design the UI", "Build the backend", "Deploy"],
      ["Plan requirements", "Design UI/UX", "Build frontend", "Build backend", "Deploy"],
      [
        "Define project requirements and goals",
        "Create wireframes and UI mockups",
        "Develop frontend components",
        "Implement API endpoints",
        "Connect frontend to backend",
        "Write tests",
        "Deploy to hosting",
      ],
      [
        "Gather stakeholder requirements",
        "Define user stories",
        "Design information architecture",
        "Create low-fidelity wireframes",
        "Create high-fidelity mockups",
        "Set up project repository",
        "Scaffold frontend project",
        "Implement page layouts and navigation",
        "Build UI components",
        "Scaffold backend project",
        "Design database schema",
        "Implement API routes",
        "Implement authentication",
        "Connect frontend to API",
        "Write unit and integration tests",
        "Set up CI/CD pipeline",
        "Deploy to staging",
        "Deploy to production",
      ],
      [
        "Run discovery meetings with stakeholders",
        "Document functional requirements",
        "Document non-functional requirements",
        "Define user personas",
        "Write user stories and acceptance criteria",
        "Map user journeys",
        "Design information architecture and sitemap",
        "Create low-fidelity wireframes",
        "Conduct usability review of wireframes",
        "Create high-fidelity mockups with design system",
        "Review and approve final designs",
        "Initialize version control repository",
        "Configure linting, formatting, and CI",
        "Scaffold frontend project with build tooling",
        "Build design system / component library",
        "Implement routing and page shells",
        "Implement all page layouts",
        "Integrate state management",
        "Scaffold backend project",
        "Design and migrate database schema",
        "Implement data models",
        "Implement REST/GraphQL API layer",
        "Implement authentication and authorization",
        "Connect frontend to API endpoints",
        "Handle loading, error, and empty states",
        "Write unit tests for logic",
        "Write integration tests for API",
        "Write end-to-end tests for critical flows",
        "Performance profiling and optimisation",
        "Security review (OWASP Top 10)",
        "Configure production environment variables",
        "Set up CI/CD pipeline",
        "Deploy to staging environment",
        "Execute UAT with stakeholders",
        "Fix bugs identified during UAT",
        "Deploy to production",
        "Monitor error logs post-launch",
      ],
    ],
  },
];

/** Generic fallback that scales the number of subtasks with temperature. */
function genericBreakdown(task: string, temperature: number): string[] {
  const base = [
    `Research and plan "${task}"`,
    `Acquire necessary resources for "${task}"`,
    `Execute the core work of "${task}"`,
    `Review and validate the output of "${task}"`,
    `Finalise and deliver "${task}"`,
  ];

  // temperature 1 → 2 subtasks, temperature 5 → 5 subtasks
  const count = Math.min(1 + temperature, base.length);
  return base.slice(0, count);
}

/**
 * Built-in heuristic provider.
 *
 * Matches the task description against a set of known templates and
 * returns subtasks at the requested detail level. Falls back to a
 * generic breakdown for unrecognised tasks.
 */
export const defaultProvider: TaskProvider = async (
  task: string,
  temperature: number
): Promise<string[]> => {
  const match = TEMPLATES.find((t) => t.pattern.test(task));
  if (match) {
    // levels is 0-indexed; temperature is 1-5
    return match.levels[temperature - 1];
  }
  return genericBreakdown(task, temperature);
};
