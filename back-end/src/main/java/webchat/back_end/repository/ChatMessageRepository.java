package webchat.back_end.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import webchat.back_end.entity.ChatMessage;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );
}
