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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public PagedResponse<SupportTicketDTO> getUserTickets(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return mapToPagedResponse(tickets);
    }

    public PagedResponse<SupportTicketDTO> getAllTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc(pageable);
        return mapToPagedResponse(tickets);
    }

    public SupportTicketDTO getTicketByIdentifier(String ticketNumber) {
        SupportTicket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
        return mapToDTO(ticket);
    }

    @Transactional
    public SupportTicketDTO createTicket(String email, SupportTicketCreateRequest request) {
        User user = userRepository.findByEmail(email).orElse(null);

        SupportTicket ticket = new SupportTicket();
        ticket.setTicketNumber("TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setUser(user);
        ticket.setSubject(request.getSubject());
        ticket.setMessage(request.getMessage());
        ticket.setCategory(request.getCategory());
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);

        return mapToDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public SupportTicketDTO createGuestTicket(SupportTicketCreateRequest request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setTicketNumber("TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setSubject(request.getSubject());
        ticket.setMessage(request.getMessage());
        ticket.setCategory(request.getCategory());
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);
        return mapToDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public SupportTicketDTO addResponse(String ticketNumber, String email, TicketResponseRequest request) {
        SupportTicket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
        User user = userRepository.findByEmail(email).orElse(null);

        TicketResponse response = new TicketResponse();
        response.setTicket(ticket);
        response.setUser(user);
        response.setMessage(request.getMessage());

        ticket.getResponses().add(response);
        if (ticket.getStatus() == SupportTicket.TicketStatus.OPEN) {
            ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
        }

        return mapToDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public SupportTicketDTO updateTicketStatus(Long id, String status) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
        ticket.setStatus(SupportTicket.TicketStatus.valueOf(status));
        return mapToDTO(ticketRepository.save(ticket));
    }

    private SupportTicketDTO mapToDTO(SupportTicket ticket) {
        return SupportTicketDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .subject(ticket.getSubject())
                .message(ticket.getMessage())
                .category(ticket.getCategory())
                .status(ticket.getStatus())
                .customerName(ticket.getUser() != null ? ticket.getUser().getFullName() : "Invitado")
                .customerEmail(ticket.getUser() != null ? ticket.getUser().getEmail() : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private PagedResponse<SupportTicketDTO> mapToPagedResponse(Page<SupportTicket> tickets) {
        return PagedResponse.<SupportTicketDTO>builder()
                .content(tickets.getContent().stream().map(this::mapToDTO).toList())
                .page(tickets.getNumber())
                .size(tickets.getSize())
                .totalElements(tickets.getTotalElements())
                .totalPages(tickets.getTotalPages())
                .first(tickets.isFirst())
                .last(tickets.isLast())
                .build();
    }
}
