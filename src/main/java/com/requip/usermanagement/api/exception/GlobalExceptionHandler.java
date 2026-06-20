package com.requip.usermanagement.api.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final URI VALIDATION_ERROR_TYPE = URI.create("https://api.requip.com/problems/validation-error");
    private static final URI CONFLICT_TYPE = URI.create("https://api.requip.com/problems/conflict");
    private static final URI NOT_FOUND_TYPE = URI.create("https://api.requip.com/problems/not-found");
    private static final URI CONCURRENT_UPDATE_TYPE = URI.create("https://api.requip.com/problems/concurrent-update");

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationFailure(MethodArgumentNotValidException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Request validation failed"
        );
        problemDetail.setType(VALIDATION_ERROR_TYPE);
        problemDetail.setTitle("Invalid request payload");
        problemDetail.setProperty("errors", fieldErrors(exception));

        return problemDetail;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "A user with the supplied unique details already exists"
        );
        problemDetail.setType(CONFLICT_TYPE);
        problemDetail.setTitle("Duplicate resource");
        problemDetail.setProperty("conflict", resolveConflict(exception));

        return problemDetail;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                exception.getMessage()
        );
        problemDetail.setType(NOT_FOUND_TYPE);
        problemDetail.setTitle("Resource not found");

        return problemDetail;
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ProblemDetail handleOptimisticLockingFailure(ObjectOptimisticLockingFailureException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "The resource was updated by another request. Refresh the latest version and try again."
        );
        problemDetail.setType(CONCURRENT_UPDATE_TYPE);
        problemDetail.setTitle("Concurrent update conflict");

        return problemDetail;
    }

    private Map<String, List<String>> fieldErrors(MethodArgumentNotValidException exception) {
        Map<String, List<String>> errors = new LinkedHashMap<>();

        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.computeIfAbsent(fieldError.getField(), ignored -> new java.util.ArrayList<>())
                    .add(fieldError.getDefaultMessage());
        }

        return errors;
    }

    private String resolveConflict(DataIntegrityViolationException exception) {
        String message = deepestMessage(exception);
        String normalizedMessage = message.toLowerCase();

        if (normalizedMessage.contains("email")) {
            return "email";
        }
        if (normalizedMessage.contains("mobile") || normalizedMessage.contains("phone")) {
            return "primaryMobile";
        }
        if (normalizedMessage.contains("pan")) {
            return "pan";
        }
        if (normalizedMessage.contains("aadhaar") || normalizedMessage.contains("aadhar")) {
            return "aadhaar";
        }

        return "uniqueField";
    }

    private String deepestMessage(Throwable throwable) {
        Throwable cursor = throwable;

        while (cursor.getCause() != null) {
            cursor = cursor.getCause();
        }

        return cursor.getMessage() == null ? "" : cursor.getMessage();
    }
}
