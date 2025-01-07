import {
  cloneAndInscribeProto,
  resolveProto,
  saveProtokey,
} from "src/utils/resolve-proto";
import { expect, test } from "vitest";
import _ from "lodash";

class ClassA {
  child: ClassB;

  constructor(readonly name: string) {
    this.child = new ClassB();
  }

  doA() {
    console.log("did");
  }
}

class ClassB {
  doB() {
    console.log("did");
  }
}

saveProtokey(ClassA, "d26cb015-523b-4936-b9be-d8f8d95ed337");
saveProtokey(ClassB, "3585ec13-3108-4ba2-9e09-e80b77196e8d");

test("should resolve prototype of a object", () => {
  const object1 = new ClassA("hello");

  const objectIncribedWithProto = cloneAndInscribeProto(object1);

  const json = JSON.stringify(objectIncribedWithProto);
  const object2: ClassA = JSON.parse(json);

  resolveProto(object2);

  expect(object1.constructor).toStrictEqual(object2.constructor);
  expect(object1.child.constructor).toStrictEqual(object2.child.constructor);

  expect(object2.doA).toBeTypeOf("function");
  expect(object2.child.doB).toBeTypeOf("function");
});

test("should resolve prototypes of objects inside a array", () => {
  type TestArray = [ClassA, ClassB];

  const array1: TestArray = [new ClassA("test"), new ClassB()];

  const json = JSON.stringify(cloneAndInscribeProto(array1));
  const array2 = resolveProto<TestArray>(JSON.parse(json));

  expect(array1[0].constructor).toStrictEqual(array2[0].constructor);
  expect(array1[0].child.constructor).toStrictEqual(
    array2[0].child.constructor,
  );
  expect(array1[1].constructor).toStrictEqual(array2[1].constructor);

  expect(array1[0].constructor).not.toStrictEqual(array2[1].constructor);
  expect(array1[0].child.constructor).toStrictEqual(array2[1].constructor);
});

test("should _.cloneDeep handle circular ref", () => {
  const a = { b: { a: null as any } };
  a.b.a = a;

  const ca = _.cloneDeep(a);

  expect(ca).toStrictEqual(ca.b.a);
});
