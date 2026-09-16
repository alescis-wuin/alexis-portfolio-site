export const visualProfiles = Object.freeze([
  { id: "mobile", width: 390, height: 844 },
  { id: "laptop-low", width: 1280, height: 800 },
  { id: "desktop-low", width: 1920, height: 800 },
  { id: "full-hd", width: 1920, height: 1080 },
  { id: "ultrawide", width: 2560, height: 1080 },
  { id: "ultrawide-large", width: 3440, height: 1440 },
]);

export const visualProjectSlugs = Object.freeze([
  "streamfolio",
  "kanban",
  "agenda",
  "calcufolio",
  "aelia",
  "alycia",
]);

const allProfiles = visualProfiles.map((profile) => profile.id);
const heroProfiles = ["mobile", "desktop-low", "ultrawide"];
const architectureProfiles = ["full-hd", "ultrawide"];

export const visualScenes = Object.freeze([
  {
    id: "home-projects",
    path: "/",
    focus: "#projets",
    profiles: allProfiles,
  },
  {
    id: "project-catalog",
    path: "/projets/",
    focus: "[data-project-catalog]",
    profiles: ["mobile", "full-hd", "ultrawide"],
  },
  ...visualProjectSlugs.flatMap((slug) => [
    {
      id: `${slug}-hero`,
      path: `/projets/${slug}.html`,
      focus: ".project-detail",
      profiles: heroProfiles,
    },
    {
      id: `${slug}-architecture`,
      path: `/projets/${slug}.html`,
      focus: "[data-project-architecture]",
      profiles: architectureProfiles,
    },
  ]),
]);

export function getVisualProfile(profileId) {
  return visualProfiles.find((profile) => profile.id === profileId) ?? null;
}

export function visualCaptureCount() {
  return visualScenes.reduce(
    (total, scene) => total + scene.profiles.length,
    0,
  );
}
