export const visualProfiles = Object.freeze([
  { id: "reflow-320", width: 320, height: 720 },
  { id: "mobile", width: 390, height: 844 },
  { id: "laptop-low", width: 1366, height: 768 },
  { id: "desktop-low", width: 1920, height: 800 },
  { id: "full-hd", width: 1920, height: 1080 },
  { id: "ultrawide", width: 2560, height: 1080 },
  { id: "ultrawide-large", width: 3440, height: 1440 },
  { id: "4k", width: 3840, height: 2160 },
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
const galleryProfiles = ["full-hd"];

export const visualScenes = Object.freeze([
  {
    id: "home-hero",
    path: "/",
    focus: "#accueil",
    profiles: allProfiles,
  },
  {
    id: "home-projects",
    path: "/",
    focus: "#projets",
    profiles: allProfiles,
  },
  {
    id: "home-skills",
    path: "/",
    focus: '[data-profile-section="skills"]',
    profiles: ["reflow-320", "mobile", "full-hd", "4k"],
  },
  {
    id: "project-catalog",
    path: "/projets/",
    focus: "[data-project-catalog]",
    profiles: ["reflow-320", "mobile", "full-hd", "ultrawide", "4k"],
  },
  {
    id: "alycia-media-viewer",
    path: "/projets/alycia.html",
    focus: "[data-media-viewer]",
    activate: "[data-project-hero] [data-media-viewer-trigger]",
    profiles: ["reflow-320", "mobile", "full-hd", "4k"],
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
    {
      id: `${slug}-gallery`,
      path: `/projets/${slug}.html`,
      focus: "[data-project-gallery]",
      profiles: galleryProfiles,
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
