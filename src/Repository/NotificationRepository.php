<?php

// src/Repository/NotificationRepository.php

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    public function findUnreadForUser(User $user): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->andWhere('n.isRead = false')
            ->setParameter('user', $user)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function markAllAsReadForUser(User $user): void
    {
        $this->createQueryBuilder('n')
            ->update()
            ->set('n.isRead', true)
            ->set('n.readAt', ':now')
            ->where('n.user = :user')
            ->andWhere('n.isRead = false')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }

    public function markAsRead(int $notificationId, User $user): bool
    {
        $notification = $this->createQueryBuilder('n')
            ->where('n.id = :id')
            ->andWhere('n.user = :user')
            ->setParameter('id', $notificationId)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();

        if ($notification) {
            $notification->setIsRead(true);
            $this->getEntityManager()->flush();

            return true;
        }

        return false;
    }

    public function createWaterReminderNotification(User $user): Notification
    {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType(Notification::TYPE_WATER_REMINDER);
        $notification->setTitle('💧 Rappel d\'hydratation');
        $notification->setMessage('N\'oubliez pas de boire un verre d\'eau pour rester hydraté !');
        $notification->setRoute('app_dashboard');

        $this->getEntityManager()->persist($notification);
        $this->getEntityManager()->flush();

        return $notification;
    }

    public function createMessageNotification(
        User $receiver,
        User $sender,
        string $messageContent
    ): Notification {
        $notification = new Notification();
        $notification->setUser($receiver);
        $notification->setType(Notification::TYPE_MESSAGE);
        $notification->setTitle('💬 Nouveau message');
        $notification->setMessage(sprintf(
            '%s vous a envoyé un message : "%s"',
            $sender->getFullName(),
            mb_strlen($messageContent) > 50 ? mb_substr($messageContent, 0, 50).'...' : $messageContent
        ));
        $notification->setRoute('app_messagerie_chat');
        $notification->setRouteParams(['userId' => $sender->getId()]);

        $this->getEntityManager()->persist($notification);
        $this->getEntityManager()->flush();

        return $notification;
    }

    public function countUnreadForUser(User $user): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->where('n.user = :user')
            ->andWhere('n.isRead = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
