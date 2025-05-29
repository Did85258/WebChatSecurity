package webchat.back_end.exception;

public class WrongUserPasswordException extends RuntimeException {
    public WrongUserPasswordException(String message) {
        super(message);
    }
}