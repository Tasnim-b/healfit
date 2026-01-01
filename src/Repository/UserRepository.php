<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface, UserLoaderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function loadUserByIdentifier(string $identifier): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.email = :email')
            ->setParameter('email', $identifier)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => $email]);
    }



            /**
     * Récupère tous les utilisateurs sauf celui spécifié
     */
public function findAllExcept(int $userId): array
{
    return $this->createQueryBuilder('u')
        ->where('u.id != :userId')
        ->setParameter('userId', $userId)
        ->orderBy('u.fullName', 'ASC')
        ->getQuery()
        ->getResult();
}


        /**
     * Récupère les utilisateurs avec qui j'ai une conversation
     */
public function findUsersWithConversations(User $currentUser): array
{
    // Requête alternative 1: Avec COALESCE
    return $this->createQueryBuilder('u')
        ->leftJoin('u.sentMessages', 'sent')
        ->leftJoin('u.receivedMessages', 'received')
        ->where('sent.receiver = :user OR received.sender = :user')
        ->andWhere('u.id != :user')
        ->setParameter('user', $currentUser)
        ->groupBy('u.id')
        ->orderBy('MAX(sent.createdAt)', 'DESC')
        ->addOrderBy('MAX(received.createdAt)', 'DESC')
        ->getQuery()
        ->getResult();
}
}
