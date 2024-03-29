import "reflect-metadata";
import faker from "faker";
import rewiremock from "rewiremock";

import {
  buildMessageMockFn,
  getMessageMockFn,
  storeMockFn,
  TopSecretHelperMock,
  validateMockFn,
} from "./__mocks__/top-secret.helper.mock";
import { decoratorMock } from "./__mocks__/decorators.mock";
import { jsonMockFn, resMock } from "./__mocks__/response.mock";
rewiremock("@codebit-labs/operacion-fuego-core").with({
  httpStatus: decoratorMock,
});
rewiremock.enable();
import { TopSecretController } from "./top-secret.controller";
rewiremock.disable();

describe("TopSecretController", () => {
  let subject: Omit<TopSecretController, "topSecretHelper"> & {
    topSecretHelper: any;
  };

  beforeAll(() => {
    subject = new TopSecretController() as any;
    subject.topSecretHelper = new TopSecretHelperMock();
  });

  it("should be defined", () => {
    expect(subject).toBeDefined();
  });

  it("should be receive imperial ship's message and emtpy returns", async () => {
    const req: any = {
      body: {
        satellites: [
          {
            name: "kenobi",
            distance: 100.0,
            message: ["este", "", "", "mensaje", ""],
          },
          {
            name: "skywalker",
            distance: 115.5,
            message: ["", "es", "", "", "secreto"],
          },
          {
            name: "sato",
            distance: 142.7,
            message: ["este", "", "un", "", ""],
          },
        ],
      },
    };
    const sendFakeReturns = {
      distance: faker.datatype.number(),
      message: faker.random.words(),
    };
    const sendMockFn = jest.fn();
    sendMockFn.mockReturnValue(sendFakeReturns);
    const res: any = {
      send: sendMockFn,
      status: () => {},
    };
    buildMessageMockFn.mockReturnValue(sendFakeReturns);
    expect(await subject.receiveMessage(req, res)).toEqual(sendFakeReturns);
    expect(sendMockFn).toHaveBeenCalledWith(sendFakeReturns);
    expect(buildMessageMockFn).toHaveBeenCalledWith(req.body.satellites);
    expect(validateMockFn).toHaveBeenCalledWith(sendFakeReturns.message);
  });

  it.skip("should be process partial messages", async () => {
    const payload = {
      distance: 100,
      message: [],
    };
    const params = { satelliteName: faker.random.word() };
    const jsonReturns = faker.lorem.paragraphs();
    jsonMockFn.mockReturnValue(jsonReturns);
    expect(
      await subject.receivePartialMessage(
        { body: payload, params } as any,
        resMock as any
      )
    ).toEqual(jsonReturns);
    expect(storeMockFn).toHaveBeenCalledWith({
      distance: payload.distance,
      message: payload.message,
      name: params.satelliteName,
    });
  });

  it("should be retrieve the message when is complete", async () => {
    const message = Array.from({ length: 3 }).map(() => faker.random.word());
    getMessageMockFn.mockReturnValue(message);
    expect(await subject.decodeMessage({} as any, resMock as any));
    expect(jsonMockFn).toHaveBeenCalledWith({
      position: [100, 49872],
      message,
    });
    expect(getMessageMockFn).toHaveBeenCalled();
  });
});
