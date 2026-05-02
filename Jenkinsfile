pipeline {

    agent any

    environment {
        IMAGE_NAME = "joujo/devops-app"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                dir('app') {
                    sh 'npm install'
                }
            }
        }

        stage('Unit Tests') {
            steps {
                dir('app') {
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('app') {
                    withSonarQubeEnv('sonarqube') {
                        sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=devops-app \
                        -Dsonar.sources=. \
                        -Dsonar.tests=tests \
                        -Dsonar.exclusions=**/node_modules/**
                        '''
                    }
                }
            }
        }



        stage('Docker Build') {
            steps {
                dir('app') {
                    sh """
                    docker build -t $IMAGE_NAME:${BUILD_NUMBER} .
                    """
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                trivy image $IMAGE_NAME:${BUILD_NUMBER}
                """
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_NAME:${BUILD_NUMBER}
                    """
                }
            }
        }
        stage('Terraform Apply') {
            steps {
                // Cette commande télécharge temporairement le secret dans une variable $KUBECONFIG
                withCredentials([file(credentialsId: 'k8s-config-file', variable: 'KUBECONFIG')]) {
                    dir('terraform'){
                        sh 'terraform init'
                        sh 'terraform apply -auto-approve'
                    }
                }
            }
        }

        stage('Ansible Deploy') {
            steps {
                dir('ansible') {

                    sh """
                    ansible-playbook \
                    -i inventory \
                    deploy.yaml \
                    --extra-vars "image=$IMAGE_NAME:${BUILD_NUMBER}"
                    """
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([file(credentialsId: 'k8s-config-file', variable: 'KUBECONFIG')]) {
                    sh '''
                    # 1. Vérifier l'état des ressources (indispensable pour votre rapport)
                    kubectl get all -n devops --insecure-skip-tls-verify=true
            
                    # 2. Récupérer l'IP du service 
                    # Note : On utilise kubectl car minikube n'est pas dans le conteneur
                    SERVICE_IP=$(kubectl get svc devops-service -n devops --insecure-skip-tls-verify=true -o jsonpath='{.spec.clusterIP}')
                    SERVICE_PORT=$(kubectl get svc devops-service -n devops --insecure-skip-tls-verify=true -o jsonpath='{.spec.ports[0].port}')
            
                    echo "Service accessible en interne sur: http://$SERVICE_IP:$SERVICE_PORT"
            
                    # 3. Test de connectivité (Optionnel selon votre app)
                    # curl -f http://$SERVICE_IP:$SERVICE_PORT/health || echo "Test de santé ignoré"
                    '''
                }
            }
        }
    }
}