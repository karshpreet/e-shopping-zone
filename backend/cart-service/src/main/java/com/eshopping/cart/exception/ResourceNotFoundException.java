package com.eshopping.cart.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String res, String field, Object val) {
        super(res + " not found with " + field + " : '" + val + "'");
    }
}
