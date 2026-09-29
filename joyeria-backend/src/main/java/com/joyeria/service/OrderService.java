package com.joyeria.service;

import com.joyeria.dto.*;
import com.joyeria.exception.ResourceNotFoundException;
import com.joyeria.model.*;
import com.joyeria.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public OrderDTO createOrder(Long userId, OrderCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío");
        }

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setShippingDepartment(request.getShippingDepartment());
        order.setRecipientName(request.getRecipientName());
        order.setPhone(request.getPhone());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNotes(request.getNotes());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
            
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException("Stock insuficiente para: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setName(product.getName());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            orderItem.setSku(product.getSku());
            orderItems.add(orderItem);

            product.setStock(product.getStock() - cartItem.getQuantity());
            product.setSoldCount(product.getSoldCount() + cartItem.getQuantity());
            productRepository.save(product);

            subtotal = subtotal.add(orderItem.getSubtotal());
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(request.getCouponCode()).orElse(null);
            if (coupon != null) {
                if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
                    discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                } else {
                    discount = coupon.getDiscountValue().min(subtotal);
                }
                coupon.setUsesCount(coupon.getUsesCount() + 1);
                couponRepository.save(coupon);
                order.setCouponCode(request.getCouponCode());
            }
        }

        BigDecimal shippingCost = subtotal.compareTo(BigDecimal.valueOf(500000)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(15000);

        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShippingCost(shippingCost);
        order.setTotal(subtotal.subtract(discount).add(shippingCost));
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setStatus(Order.OrderStatus.PENDING);

        order = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToDTO(order);
    }

    public PagedResponse<OrderDTO> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return mapToPagedResponse(orders);
    }

    public PagedResponse<OrderDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return mapToPagedResponse(orders);
    }

    public PagedResponse<OrderDTO> getOrdersByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByStatus(Order.OrderStatus.valueOf(status), pageable);
        return mapToPagedResponse(orders);
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        return mapToDTO(order);
    }

    public OrderDTO getOrderByIdentifier(String identifier) {
        Order order = orderRepository.findByOrderNumber(identifier).orElse(null);
        if (order == null) {
            try {
                order = orderRepository.findById(Long.parseLong(identifier)).orElse(null);
            } catch (NumberFormatException ignored) {}
        }
        if (order == null) throw new ResourceNotFoundException("Pedido no encontrado");
        return mapToDTO(order);
    }

    public OrderDTO getOrderByIdForUser(Long id, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Pedido no encontrado");
        }
        return mapToDTO(order);
    }

    public OrderDTO getOrderByIdentifierForUser(String identifier, Long userId, boolean isAdmin) {
        Order order = orderRepository.findByOrderNumber(identifier).orElse(null);
        if (order == null) {
            try {
                order = orderRepository.findById(Long.parseLong(identifier)).orElse(null);
            } catch (NumberFormatException ignored) {}
        }
        if (order == null) throw new ResourceNotFoundException("Pedido no encontrado");
        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Pedido no encontrado");
        }
        return mapToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);
        Order.OrderStatus currentStatus = order.getStatus();
        
        // Validar transiciones de estado permitidas
        boolean validTransition = switch (currentStatus) {
            case PENDING -> newStatus == Order.OrderStatus.PAID || newStatus == Order.OrderStatus.CANCELLED;
            case PAID -> newStatus == Order.OrderStatus.PREPARING || newStatus == Order.OrderStatus.CANCELLED;
            case PREPARING -> newStatus == Order.OrderStatus.SHIPPED || newStatus == Order.OrderStatus.CANCELLED;
            case SHIPPED -> newStatus == Order.OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
        
        if (!validTransition) {
            throw new IllegalStateException("Transición de estado no permitida: " + currentStatus + " -> " + newStatus);
        }
        
        order.setStatus(newStatus);
        if (newStatus == Order.OrderStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
        }
        if (newStatus == Order.OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setStock(product.getStock() + item.getQuantity());
                    product.setSoldCount(Math.max(0, product.getSoldCount() - item.getQuantity()));
                    productRepository.save(product);
                }
            }
        }
        return mapToDTO(orderRepository.save(order));
    }

    public DashboardStatsDTO getDashboardStats() {
        return DashboardStatsDTO.builder()
                .totalOrders(orderRepository.count())
                .totalRevenue(orderRepository.sumAllTotals())
                .totalProducts(productRepository.count())
                .totalUsers(userRepository.count())
                .pendingOrders(orderRepository.findByStatus(Order.OrderStatus.PENDING,
                        PageRequest.of(0, 1)).getTotalElements())
                .build();
    }

    private OrderDTO mapToDTO(Order order) {
        List<OrderItemDTO> items = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .name(item.getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .sku(item.getSku())
                        .image(item.getProduct() != null && !item.getProduct().getImages().isEmpty() ?
                                item.getProduct().getImages().get(0).getUrl() : null)
                        .build()
                ).toList();

        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .shippingCost(order.getShippingCost())
                .total(order.getTotal())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingDepartment(order.getShippingDepartment())
                .recipientName(order.getRecipientName())
                .phone(order.getPhone())
                .paymentMethod(order.getPaymentMethod())
                .couponCode(order.getCouponCode())
                .trackingNumber(order.getTrackingNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private PagedResponse<OrderDTO> mapToPagedResponse(Page<Order> orders) {
        return PagedResponse.<OrderDTO>builder()
                .content(orders.getContent().stream().map(this::mapToDTO).toList())
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .first(orders.isFirst())
                .last(orders.isLast())
                .build();
    }
}
