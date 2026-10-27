export function validateJwtSecret(
  secret: string | undefined,
): asserts secret is string {
  if (
    !secret ||
    Buffer.byteLength(secret, "utf8") < 32 ||
    secret.trim() !== secret
  ) {
    throw new Error(
      "JWT_SECRET_KEY must contain at least 32 bytes and have no surrounding whitespace.",
    );
  }
}
