package webchat.back_end.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import webchat.back_end.entity.Images;
import webchat.back_end.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagesRepository extends MongoRepository<Images, String> {
    Optional<Images> findByMessageId(String message_id);

}
