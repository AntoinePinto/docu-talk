import random
import time

def retry_with_exponential_backoff(
        initial_delay: float = 1,
        exponential_base: float = 2,
        jitter: bool = True,
        max_retries: int = 5,
        errors: tuple = (AttributeError,),
    ):
    """
    A decorator to retry a function with exponential backoff in case of specified
    errors.

    Parameters
    ----------
    initial_delay : float, optional
        The initial delay before retrying, in seconds (default is 1).
    exponential_base : float, optional
        The base for the exponential growth of the delay (default is 2).
    jitter : bool, optional
        Whether to add random jitter to the delay (default is True).
    max_retries : int, optional
        The maximum number of retries before raising an exception (default is 5).
    errors : tuple, optional
        A tuple of exception classes to catch and retry upon.

    Returns
    -------
    function
        A wrapped function that retries on specified errors with exponential backoff.

    Raises
    ------
    Exception
        If the maximum number of retries is exceeded.
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            num_retries = 0
            delay = initial_delay

            while True:
                try:
                    return func(*args, **kwargs)

                except errors as e:
                    num_retries += 1
                    if num_retries > max_retries:
                        raise Exception(
                            f"Maximum number of retries ({max_retries}) exceeded."
                        )

                    delay *= exponential_base * (1 + jitter * random.random())

                    print(
                        f"{type(e).__name__}: {e} => Retry in "
                        f"{round(delay, 2)} seconds"
                    )
                    
                    time.sleep(delay)

                except Exception as e:
                    raise e

        return wrapper

    return decorator