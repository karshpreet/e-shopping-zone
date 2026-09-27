package com.eshopping.product.service;

import com.eshopping.product.dto.CategoryDto;
import com.eshopping.product.dto.CreateCategoryRequest;
import com.eshopping.product.entity.Category;
import com.eshopping.product.exception.BadRequestException;
import com.eshopping.product.exception.ResourceNotFoundException;
import com.eshopping.product.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = new Category(
                request.getName(),
                request.getDescription(),
                request.getIconName()
        );
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    private CategoryDto mapToDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIconName()
        );
    }
}
