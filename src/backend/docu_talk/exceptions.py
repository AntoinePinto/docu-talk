class InvalidAuthentication(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

class TooManyDocuments(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

class TooManyPages(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)

class BadOutputFormat(Exception):

    def __init__(self, message="An error has occurred"):
        self.message = message
        super().__init__(self.message)
