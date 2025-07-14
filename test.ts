import 'reflect-metadata';

const meta = new Map<string, any[]>();

class ServiceContainer {
    services = new Map<Function, any>();

    get(instanceClass: any) {
        if (this.services.has(instanceClass)) {
            return this.services.get(instanceClass);
        }

        const instance = new instanceClass();

        console.info('Creating instance of', instanceClass.name);
        this.services.set(instanceClass, instance);
        return instance;
    }
}

function InjectDependencies() {
    return function (target: any, propertyKey: string) {
        const metadata = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        meta.set(target.constructor.name + ':' + propertyKey, metadata);
    };
}

class ServiceA {

}

class ServiceB {

}

class ServiceC {

}

class TestController {

    @InjectDependencies()
    getPosts(c: ServiceC, b: ServiceB) {
        console.info('c', c.constructor.name);
        console.info('b', b.constructor.name);
    }

    @InjectDependencies()
    getUsers(b: ServiceB, a: ServiceA) {
        console.info('a', a.constructor.name);
        console.info('b', b.constructor.name);
    }

}

const container = new ServiceContainer();

class Executor {
    exec(instanceClass: any, method: string) {
        const instance = container.get(instanceClass);

        const args = meta.get(instanceClass.name + ':' + method) ?? [];
        const params = [];

        for (let param of args) {
            params.push(
                container.get(param)
            );
        }

        instance[method](...params);

    }
}

console.info(meta);

new Executor().exec(TestController, 'getPosts')
new Executor().exec(TestController, 'getUsers')

console.info('hi');
