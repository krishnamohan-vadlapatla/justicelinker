package com.justicelinker.repository;

import com.justicelinker.model.Complaint;
import com.justicelinker.model.ComplaintUpvote;
import com.justicelinker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintUpvoteRepository extends JpaRepository<ComplaintUpvote, Long> {
    Optional<ComplaintUpvote> findByUserAndComplaint(User user, Complaint complaint);

    long countByComplaint(Complaint complaint);
}
