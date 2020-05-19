export type ProjectUserPostParams = {
    id:string
  }
  
  export type ProjectUserPostBody = { 
    userId: string
  }


  export type UsersGetParams = {
    id: string;
  };
  
  export type ProjectsGetParams = {
    id: string;
  };
  
  export type UsersPostBody = {
    username: string,
    email: string,
    password: string
  }
  
  export type ProjectsPostBody = {
    name: string,
    description: string
  }