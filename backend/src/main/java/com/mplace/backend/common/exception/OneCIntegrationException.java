package com.mplace.backend.common.exception;

/**
 * Thrown when a call to the 1C integration (via OneCClient) fails.
 * Kept generic on purpose — the concrete OneCClient implementation
 * (Mock today, Http later) decides what counts as a failure.
 */
public class OneCIntegrationException extends RuntimeException {

    public OneCIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
