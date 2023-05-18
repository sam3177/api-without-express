export type RouteHandlerType = (
	req: any,
	res: (statusCode: number, payload?: any) => void,
) => void;

export enum RequestMethodsEnum {
	GET = 'get',
	POST = 'post',
	PUT = 'put',
	DELETE = 'delete',
	HEAD = 'head',
	PATCH = 'patch',
	OPTIONS = 'options',
	CONNECT = 'connect',
	TRACE = 'trace',
}

export interface RouterInterface {
	routes: {
		[K in RequestMethodsEnum]?: { [key: string]: RouteHandlerType };
	} & {
		notFound: RouteHandlerType;
		ping: RouteHandlerType;
	};
	registerRoute: (
		method: RequestMethodsEnum,
		path: string,
		handler: RouteHandlerType,
	) => void;
	getHandlerAndParams: (
		route: string,
		method: RequestMethodsEnum,
	) => {
		handler: RouteHandlerType;
		params?: { [key: string]: string };
	};
}

export interface UserInterface {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	password: {
		passwordHash: string;
		authToken?: string;
		resetPasswordToken?: string;
		resetPasswordTokenExpires?: number;
	};
}
