export const en = {
  meta: {
    title: "Vitrine: your React components, on display",
    description:
      "Put /** @preview */ above a React component and see it in a live gallery beside your editor, rendered by your own Vite dev server.",
  },
  header: {
    howItWorks: "How it works",
    features: "Features",
    docs: "Docs",
    faq: "FAQ",
    getStarted: "Get started",
    switchLanguage: "한국어",
  },
  hero: {
    label: "A component gallery for React and Vite",
    titleLead: "Your components,",
    titleAccent: "on display.",
    lead: "Add one comment above an export. Vitrine renders it in a live gallery beside your editor through your Vite dev server.",
    copy: "Copy",
    copied: "Copied",
    extension: "Get the VS Code extension",
    demoHint: "Select a preview to update the gallery",
  },
  demo: {
    editorTab: "Button.tsx",
    vitrineTab: "Vitrine",
    exhibitNumber: "No.",
    pause: "Pause",
    play: "Play",
    ariaLabel: "An editor with @preview comments. Select one to update the gallery preview.",
  },
  howItWorks: {
    label: "How it works",
    title: "Start with one comment.",
    lead: "Components render in your own Vite setup, with your aliases, plugins, CSS and HMR.",
    demoAria: "Two components are written with @preview comments. They appear in the gallery sidebar, and moving the cursor switches the preview.",
    waitingForPreview: "Add @preview to see the component",
    scanningPreview: "Updating previews",
    previewReady: "Live",
    steps: [
      { title: "Mark a preview", medium: "/** @preview */", text: "Add the comment above an exported component. The preview stays with its source." },
      { title: "Run the server", medium: "vite dev", text: "Add the plugin and start your dev server as usual. Vitrine only runs during development." },
      { title: "Open the gallery", medium: "/__vitrine", text: "Use it in a browser, or beside your editor with the VS Code extension." },
    ],
  },
  features: {
    label: "Features",
    title: "Work with previews more easily.",
    items: [
      { id: "props", title: "Props controls", medium: "from your types", text: "Controls are generated from prop types, including types imported from other files." },
      { id: "variants", title: "Variants", medium: "preview()", text: "Name a few sets of props and switch between them in the gallery." },
      { id: "cursor", title: "Follows your cursor", medium: "VS Code", text: "Move onto a @preview export and the panel switches to it." },
      { id: "groups", title: "Groups", medium: 'name="Inputs/Button"', text: "A slash in the name files the preview into a sidebar group." },
    ],
  },
  compatibility: {
    label: "Compatibility",
    title: "Fits the setup you already have.",
    lead: "Supports React 18 and 19 and Vite 6.4 and later. Previews use your Vite config, so aliases, CSS and plugins behave as they do in your app.",
  },
  docs: {
    meta: {
      title: "Getting started with Vitrine",
      description: "Install Vitrine, add it to Vite and display your first React component preview.",
    },
    label: "Getting started",
    title: "Add your first component.",
    lead: "Connect Vitrine to an existing React and Vite app in four steps.",
    steps: [
      {
        title: "Install the plugin",
        text: "Add Vitrine as a development dependency in your app.",
      },
      {
        title: "Add it to Vite",
        text: "Place vitrine() next to the React plugin in vite.config.ts. It only runs during vite serve and adds nothing to your production build.",
      },
      {
        title: "Mark a component",
        text: "Put the comment directly above an exported component. The export name becomes its label in the gallery.",
      },
      {
        title: "Open the gallery",
        text: "Start your dev server as usual, then open /__vitrine on the same origin.",
      },
    ],
    openGallery: "For example, if Vite starts on port 5173, open",
    declarations: {
      title: "Declare and group previews",
      lead: "Place @preview directly above an exported component. Vitrine uses the export name in the sidebar unless you provide a name.",
      rules: [
        "Use it with export const, export function or export default",
        "Set a custom sidebar label with name=\"...\"",
        "Use / inside the name to create sidebar groups",
        "Anonymous default exports use the file name",
      ],
    },
    controls: {
      title: "Set args, controls and variants",
      lead: "Vitrine generates controls from your prop types. Use preview() when a component needs sample values, a different control or named variants.",
      supported: "Automatic controls support string, number, boolean and string or number literal unions, including types imported from other files.",
      options: [
        { name: "args", text: "Initial prop values" },
        { name: "controls", text: "Control type for each prop, including text, number, boolean, select and radio" },
        { name: "variants", text: "Named sets of args that can be selected in the gallery" },
        { name: "defaultVariant", text: "The variant selected first" },
      ],
      note: "preview() only registers metadata. It does not wrap or change your component.",
    },
    nextTitle: "Open it beside your editor",
    nextText: "Install the VS Code extension to switch previews as your cursor moves. For controls, variants, groups and plugin options, continue to the complete package guide.",
    extension: "Install the VS Code extension",
    fullGuide: "Read the complete guide",
  },
  faq: {
    label: "FAQ",
    title: "Common questions.",
    items: [
      { question: "Does Vitrine change my production build?", answer: "No. The plugin only runs during vite serve and adds nothing to your build output." },
      { question: "Do I need the VS Code extension?", answer: "No. The gallery works in any browser at /__vitrine. The extension adds a side panel that follows your cursor." },
      { question: "Why does a .vitrine folder appear in my project?", answer: "The plugin writes its port there so the extension can find your dev server. The folder ignores itself, so it never shows up in commits." },
    ],
    reportIssue: {
      question: "Something is not working. Where do I report it?",
      beforeLink: "Open an issue on ",
      link: "GitHub",
      afterLink: " with your React and Vite versions",
    },
  },
  footer: {
    tagline: "MIT licensed. Made for React and Vite.",
    reportIssue: "Report an issue",
  },
};

export type Messages = typeof en;
