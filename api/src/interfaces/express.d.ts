declare namespace Express {
	export interface Response {
		locals: {
			userId?: number;
	  	};
	}
}