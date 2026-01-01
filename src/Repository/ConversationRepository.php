<?php
namespace App\Repository;

use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Conversation>
 */
class ConversationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conversation::class);
    }

    public function findConversationBetweenUsers(User $user1, User $user2): ?Conversation
    {
        return $this->createQueryBuilder('c')
            ->where('(c.user1 = :user1 AND c.user2 = :user2) OR (c.user1 = :user2 AND c.user2 = :user1)')
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2)
            ->getQuery()
            ->getOneOrNullResult();
    }

public function findConversationsForUser(User $user): array
{
    $conversations = $this->createQueryBuilder('c')
        ->leftJoin('c.user1', 'u1')
        ->leftJoin('c.user2', 'u2')
        ->addSelect('u1', 'u2')
        ->where('c.user1 = :user OR c.user2 = :user')
        ->setParameter('user', $user)
        ->orderBy('c.lastMessageAt', 'DESC')
        ->addOrderBy('c.updatedAt', 'DESC')
        ->getQuery()
        ->getResult();

    // Forcer le chargement des messages pour chaque conversation
    foreach ($conversations as $conversation) {
        // Cette ligne force Doctrine à charger les messages
        $conversation->getMessages()->initialize();
    }

    return $conversations;
}

    public function createConversation(User $user1, User $user2): Conversation
    {
        $conversation = new Conversation();
        $conversation->setUser1($user1);
        $conversation->setUser2($user2);

        $this->getEntityManager()->persist($conversation);
        $this->getEntityManager()->flush();

        return $conversation;
    }





    public function findOrCreateConversation(User $user1, User $user2): Conversation
{
    $conversation = $this->findConversationBetweenUsers($user1, $user2);

    if (!$conversation) {
        $conversation = new Conversation();
        $conversation->setUser1($user1);
        $conversation->setUser2($user2);
        $conversation->setCreatedAt(new \DateTimeImmutable());
        $conversation->setUpdatedAt(new \DateTimeImmutable());

        $this->getEntityManager()->persist($conversation);
        $this->getEntityManager()->flush();
    }

    return $conversation;
}
}
