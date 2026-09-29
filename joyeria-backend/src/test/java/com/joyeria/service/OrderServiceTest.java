package com.joyeria.service;

import com.joyeria.dto.OrderCreateRequest;
import com.joyeria.dto.OrderDTO;
import com.joyeria.exception.ResourceNotFoundException;
import com.joyeria.model.*;
import com.joyeria.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@example.com");

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Test Product");
        testProduct.setPrice(new BigDecimal("100000"));
        testProduct.setStock(10);
        testProduct.setSoldCount(0);
        testProduct.setSku("TEST-001");

        testCart = new Cart();
        testCart.setId(1L);
        testCart.setUser(testUser);

        testCartItem = new CartItem();
        testCartItem.setId(1L);
        testCartItem.setCart(testCart);
        testCartItem.setProduct(testProduct);
        testCartItem.setQuantity(2);

        List<CartItem> items = new ArrayList<>();
        items.add(testCartItem);
        testCart.setItems(items);
    }

    @Test
    void createOrder_WithEmptyCart_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        testCart.setItems(new ArrayList<>());

        OrderCreateRequest request = new OrderCreateRequest();
        request.setShippingAddress("Test Address");
        request.setShippingCity("Bogota");
        request.setPaymentMethod("card");

        assertThrows(IllegalStateException.class, () -> orderService.createOrder(1L, request));
    }

    @Test
    void createOrder_WithInsufficientStock_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        testProduct.setStock(1);

        OrderCreateRequest request = new OrderCreateRequest();
        request.setShippingAddress("Test Address");
        request.setShippingCity("Bogota");
        request.setPaymentMethod("card");

        assertThrows(IllegalStateException.class, () -> orderService.createOrder(1L, request));
    }

    @Test
    void getOrderById_WithNonExistentOrder_ThrowsException() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(999L));
    }

    @Test
    void updateOrderStatus_WithInvalidTransition_ThrowsException() {
        Order order = new Order();
        order.setId(1L);
        order.setStatus(Order.OrderStatus.DELIVERED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class, () -> orderService.updateOrderStatus(1L, "PENDING"));
    }
}
