export default class HivenApiError extends Error {
  constructor(code: number, message: string) {
    super(message);

    this.name = `[HivenApiError]: ${code}`;
  }
}
