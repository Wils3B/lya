export class AddLocaleCommand {
  constructor(
    public readonly projectId: string,
    public readonly localeCode: string
  ) {}
}
