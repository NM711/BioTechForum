import UserAuth from "./auth"; 
import UserQueries from "./user";

class ModelDirector {
  private static context: ModelDirector;
  public Auth: UserAuth;
  public User: UserQueries;  
  private constructor() {
    this.Auth = new UserAuth();
    this.User = new UserQueries();
  };

  /**
    Get context to database operations.
  */
  
  public static get ContextInstance() {
    // If context is yet to be initializer create a new one. If not return the existing instance.
    
    if (!ModelDirector.context) {
      ModelDirector.context = new ModelDirector();     
    };

    return ModelDirector.context;
  };
};

export default ModelDirector;
