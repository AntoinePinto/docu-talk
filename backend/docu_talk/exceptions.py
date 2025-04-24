class InvalidAuthenticationError(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

class TooManyDocumentsError(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

class TooManyPagesError(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

class BadOutputFormatError(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)
