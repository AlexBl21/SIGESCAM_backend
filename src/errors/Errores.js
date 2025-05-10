

export class NotFoundError extends Error{
    constructor(message){
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
       };
};

export class BadRequestError extends Error{
    constructor(message){
        super(message);
        this.name = "BadRequestError";
        this.statusCode = 400;
    };
};

export class InternalServerError extends Error{
    constructor(message){
        super(message);
        this.name = "InternalServerError";
        this.statusCode = 500;
    }
};
//este es para cuando un registro ya existe
export class Conflict extends Error{
    constructor(message){
        super(message);
        this.name = "Confict";
        this.statusCode = 409;
    }
}