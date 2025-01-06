import { test, expect, describe } from "vitest";
import CryptorWithPassword, {
  CryptorWithPasswordDecryptError,
  CryptorWithPasswordDecryptErrorCause,
  CryptorWithPasswordInitError,
} from "src/utils/cryptor-with-password";

function CWPDECause(cause: CryptorWithPasswordDecryptErrorCause) {
  return cause;
}

describe(CryptorWithPassword, () => {
  test(`Constructor shold throw a ${CryptorWithPasswordInitError.name} if password is empity`, () => {
    expect(() => new CryptorWithPassword({ password: "" })).toThrow(
      CryptorWithPasswordInitError
    );
  });

  test(`Shold encrypt and decrypt correctly the data if password is correct`, async () => {
    const cryptor = new CryptorWithPassword({
      password: "password123",
    });

    const initialBuffer = Buffer.from("secret information 123456");

    const encryptedBuffer = await cryptor.encrypt(initialBuffer);
    const decryptedBuffer = await cryptor.decrypt(encryptedBuffer);

    expect(decryptedBuffer).toEqual(initialBuffer);
  });

  test(`Shold throw a ${
    CryptorWithPasswordDecryptError.name
  } with cause ${CWPDECause(
    "probable-incorrect-password"
  )} if password is incorrect`, async () => {
    const cryptor1 = new CryptorWithPassword({
      password: "password123",
    });

    const cryptor2 = new CryptorWithPassword({
      password: "incorrect_password",
    });

    const initialBuffer = Buffer.from("secret information 123456");

    const encryptedBuffer = await cryptor1.encrypt(initialBuffer);
    const decryptedBuffer = cryptor2.decrypt(encryptedBuffer);

    await expect(decryptedBuffer)
      .rejects.toBeInstanceOf(CryptorWithPasswordDecryptError)
      .catch((error) => {
        if (error instanceof CryptorWithPasswordDecryptError) {
          return expect(error.cause).toEqual(
            "probable-incorrect-password" satisfies CryptorWithPasswordDecryptErrorCause
          );
        } else {
          expect.fail(
            `Error don't is instance of ${CryptorWithPasswordDecryptError.name}`
          );
        }
      });
  });
});
