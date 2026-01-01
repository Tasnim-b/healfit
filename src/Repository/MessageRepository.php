<?php
// src/Repository/MessageRepository.php

namespace App\Repository;

use App\Entity\Message;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    /**
     * Trouve les conversations d'un utilisateur
     */
    public function findConversations(User $user): array
    {
        return [];
        // $qb = $this->createQueryBuilder('m');

        // return $qb
        //     ->select('DISTINCT u.id, u.fullName, u.profileImage, m.content as lastMessage, m.createdAt as lastMessageDate')
        //     ->join('m.sender', 's')
        //     ->join('m.receiver', 'r')
        //     ->leftJoin('App\Entity\User', 'u', 'WITH', 'u.id = CASE WHEN m.sender = :user THEN r.id ELSE s.id END')
        //     ->where('m.sender = :user OR m.receiver = :user')
        //     ->orderBy('m.createdAt', 'DESC')
        //     ->setParameter('user', $user)
        //     ->groupBy('u.id')
        //     ->getQuery()
        //     ->getResult();
    }

    /**
     * Trouve les messages entre deux utilisateurs
     */
    public function findMessagesBetweenUsers(User $user1, User $user2): array
    {
        return $this->createQueryBuilder('m')
            ->where('(m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)')
            ->orderBy('m.createdAt', 'ASC')
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2)
            ->getQuery()
            ->getResult();
    }

    /**
     * Compte les messages non lus
     */
    public function countUnreadMessages(User $user): int
    {
        return (int) $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.receiver = :user')
            ->andWhere('m.isRead = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Trouve les messages non lus
     */
    public function findUnreadMessages(User $receiver, User $sender): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.receiver = :receiver')
            ->andWhere('m.sender = :sender')
            ->andWhere('m.isRead = false')
            ->orderBy('m.createdAt', 'ASC')
            ->setParameter('receiver', $receiver)
            ->setParameter('sender', $sender)
            ->getQuery()
            ->getResult();
    }

    /**
     * Marque les messages comme lus
     */
    public function markAsRead(User $receiver, User $sender): void
    {
        $this->createQueryBuilder('m')
            ->update()
            ->set('m.isRead', true)
            ->set('m.readAt', ':now')
            ->where('m.receiver = :receiver')
            ->andWhere('m.sender = :sender')
            ->andWhere('m.isRead = false')
            ->setParameter('receiver', $receiver)
            ->setParameter('sender', $sender)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }




/**
 * Trouve le dernier message entre deux utilisateurs
 */
public function findLastMessageBetweenUsers(User $user1, User $user2): ?Message
{
    return $this->createQueryBuilder('m')
        ->where('(m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)')
        ->orderBy('m.createdAt', 'DESC')
        ->setMaxResults(1)
        ->setParameter('user1', $user1)
        ->setParameter('user2', $user2)
        ->getQuery()
        ->getOneOrNullResult();
}

/**
 * Compte les messages non lus entre deux utilisateurs
 */
public function countUnreadMessagesBetweenUsers(User $currentUser, User $otherUser): int
{
    return (int) $this->createQueryBuilder('m')
        ->select('COUNT(m.id)')
        ->where('m.sender = :sender AND m.receiver = :receiver AND m.isRead = false')
        ->setParameter('sender', $otherUser)
        ->setParameter('receiver', $currentUser)
        ->getQuery()
        ->getSingleScalarResult();
}



/**
 * Récupère les conversations avec le dernier message et le nombre de messages non lus
  *//**
 * Récupère toutes les conversations avec le dernier message et le nombre de messages non lus
 * Version simple et efficace pour MySQL
 */
public function getConversationsWithDetails(User $currentUser): array
{
    $conn = $this->getEntityManager()->getConnection();
    $currentUserId = $currentUser->getId();

    // Requête optimisée pour MySQL
    $sql = "
        SELECT
            u.id as user_id,
            u.full_name,
            u.profile_image,
            u.email,
            last_msg.content as last_message_content,
            last_msg.created_at as last_message_date,
            last_msg.sender_id as last_message_sender_id,
            last_msg.is_read as last_message_is_read,
            COALESCE(unread.count, 0) as unread_count
        FROM user u
        INNER JOIN (
            SELECT
                CASE
                    WHEN sender_id = ? THEN receiver_id
                    ELSE sender_id
                END as other_user_id,
                MAX(id) as last_message_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY other_user_id
        ) conversation ON conversation.other_user_id = u.id
        INNER JOIN messages last_msg ON last_msg.id = conversation.last_message_id
        LEFT JOIN (
            SELECT sender_id, COUNT(*) as count
            FROM messages
            WHERE receiver_id = ? AND is_read = 0
            GROUP BY sender_id
        ) unread ON unread.sender_id = u.id
        WHERE u.id != ?
        ORDER BY last_msg.created_at DESC
    ";

    try {
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            $currentUserId,
            $currentUserId,
            $currentUserId,
            $currentUserId,
            $currentUserId
        ]);

        return $result->fetchAllAssociative();
    } catch (\Exception $e) {
        // En cas d'erreur, retourner un tableau vide
        error_log('Erreur SQL: ' . $e->getMessage());
        return [];
    }
}

}
