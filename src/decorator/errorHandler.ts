import logger from "../log/logger";

function ErrorHandler(classPrototype: any, methodName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        try {
            let result = method.apply(classPrototype, args)
            return result
        } catch (err) {
            console.error(err)
            logger.error(err)
            return false
        }
    }
    return descriptor
}

export default ErrorHandler;