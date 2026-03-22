export class RemoveLocaleCommand {
  constructor(
    public readonly projectId: string,
    public readonly localeCode: string
  ) {}
}
