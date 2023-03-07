import logger from "../log/logger";

function ErrorHandler(classPrototype: any, methodName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function () {
        try {
            method()
        } catch (err) {
            logger.error(err)
        }
    }
}

export default ErrorHandler;