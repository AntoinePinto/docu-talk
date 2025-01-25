import os

def get_param_or_env(
        param: str | None, 
        env_var: str
    ) -> str | None:
    """
    Retrieves a parameter value if provided, otherwise fetches it from an environment 
    variable.

    Parameters
    ----------
    param : str or None
        The parameter value provided by the user.
    env_var : str
        The name of the environment variable to check if the parameter is None.

    Returns
    -------
    str or None
        The value of the parameter or the environment variable.

    Raises
    ------
    Exception
        If neither the parameter nor the environment variable is set.
    """
    
    if param is not None:
        return param
    elif os.getenv(env_var) is not None:
        return os.getenv(env_var)
    else:
        raise Exception(
            f"{env_var} is not set. You should specify it as a parameter or "
            "as an environment variable."
        )