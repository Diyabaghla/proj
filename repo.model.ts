export interface ExtraLink {
  id: string;
  label: string;
  url: string;
}

export interface Repo {
  id: string;
  name: string;
  description: string;
  team: string;
  qaLink: string;
  repoLink: string;
  appLink: string;
  appSettings: string; // appsettings.json content
  appSettingsLocal: string; // appsettings.local.json content
  /** Extra links a developer added themselves via the card's ⋮ menu (setup docs, Postman collections, etc.). */
  extraLinks: ExtraLink[];
}

/** Which settings file the modal is currently showing. */
export type SettingsFileType = 'production' | 'local';
