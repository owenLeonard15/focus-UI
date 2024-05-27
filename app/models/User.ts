// User model is a class that represents a user in the system

export class User {
    id: string;
    email: string;
    password: string;
    confirmed: boolean;
    updatedAt: Date;
    
    constructor(id: string, email: string, password: string, confirmed: boolean, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.confirmed = confirmed;
        this.updatedAt = updatedAt;
    }
}

