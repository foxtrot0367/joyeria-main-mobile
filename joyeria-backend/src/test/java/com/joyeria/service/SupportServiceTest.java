package com.joyeria.service;

import com.joyeria.dto.TicketResponseRequest;
import com.joyeria.exception.ResourceNotFoundException;
import com.joyeria.model.SupportTicket;
import com.joyeria.model.User;
import com.joyeria.repository.SupportTicketRepository;
import com.joyeria.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupportServiceTest {

    @Mock
    private SupportTicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SupportService supportService;

    private SupportTicket ticket;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@example.com");
        owner.setFirstName("Own");
        owner.setLastName("Er");

        ticket = new SupportTicket();
        ticket.setId(10L);
        ticket.setTicketNumber("TKT-ABC12345");
        ticket.setUser(owner);
        ticket.setSubject("Pedido no llega");
        ticket.setMessage("Mi pedido sigue pendiente");
        ticket.setCategory(SupportTicket.TicketCategory.SHIPPING);
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);
    }

    @Test
    void getTicketByIdentifier_ownerCanRead() {
        when(ticketRepository.findByTicketNumber("TKT-ABC12345")).thenReturn(Optional.of(ticket));

        var dto = supportService.getTicketByIdentifier("TKT-ABC12345", "owner@example.com");

        assertEquals("TKT-ABC12345", dto.getTicketNumber());
    }

    @Test
    void getTicketByIdentifier_otherUserGetsNotFound() {
        when(ticketRepository.findByTicketNumber("TKT-ABC12345")).thenReturn(Optional.of(ticket));

        assertThrows(ResourceNotFoundException.class,
                () -> supportService.getTicketByIdentifier("TKT-ABC12345", "intruder@example.com"));
    }

    @Test
    void getTicketByIdentifier_ticketWithoutUserIsNotFoundForEveryone() {
        ticket.setUser(null);
        when(ticketRepository.findByTicketNumber("TKT-ABC12345")).thenReturn(Optional.of(ticket));

        assertThrows(ResourceNotFoundException.class,
                () -> supportService.getTicketByIdentifier("TKT-ABC12345", "owner@example.com"));
    }

    @Test
    void addResponse_otherUserGetsNotFound() {
        when(ticketRepository.findByTicketNumber("TKT-ABC12345")).thenReturn(Optional.of(ticket));
        TicketResponseRequest request = new TicketResponseRequest("¿Alguna novedad?");

        assertThrows(ResourceNotFoundException.class,
                () -> supportService.addResponse("TKT-ABC12345", "intruder@example.com", request));
    }

    @Test
    void addResponse_ownerCanRespond() {
        when(ticketRepository.findByTicketNumber("TKT-ABC12345")).thenReturn(Optional.of(ticket));
        User ownerFromDb = owner;
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerFromDb));
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(inv -> inv.getArgument(0));
        TicketResponseRequest request = new TicketResponseRequest("¿Alguna novedad?");

        var dto = supportService.addResponse("TKT-ABC12345", "owner@example.com", request);

        assertEquals(SupportTicket.TicketStatus.IN_PROGRESS, dto.getStatus());
        assertEquals(1, ticket.getResponses().size());
    }
}
