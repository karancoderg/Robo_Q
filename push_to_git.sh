#!/bin/bash

echo "🚀 Robo-Q Git Push Helper"
echo "========================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run this from the project root."
    exit 1
fi

echo "📋 Current Git Status:"
git status --short
echo ""

echo "🔗 Choose your Git hosting platform:"
echo "1) GitHub"
echo "2) GitLab" 
echo "3) Bitbucket"
echo "4) Custom Git URL"
echo "5) Show current remotes"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📝 GitHub Setup:"
        echo "1. Go to https://github.com/new"
        echo "2. Create a new repository named 'robo-q' or 'robo_Q'"
        echo "3. Don't initialize with README (we already have one)"
        echo ""
        read -p "Enter your GitHub username: " username
        read -p "Enter repository name (default: robo-q): " repo_name
        repo_name=${repo_name:-robo-q}
        
        remote_url="https://github.com/$username/$repo_name.git"
        echo ""
        echo "🔗 Adding GitHub remote: $remote_url"
        git remote add origin "$remote_url"
        ;;
    2)
        echo ""
        echo "📝 GitLab Setup:"
        echo "1. Go to https://gitlab.com/projects/new"
        echo "2. Create a new project named 'robo-q'"
        echo "3. Don't initialize with README"
        echo ""
        read -p "Enter your GitLab username: " username
        read -p "Enter repository name (default: robo-q): " repo_name
        repo_name=${repo_name:-robo-q}
        
        remote_url="https://gitlab.com/$username/$repo_name.git"
        echo ""
        echo "🔗 Adding GitLab remote: $remote_url"
        git remote add origin "$remote_url"
        ;;
    3)
        echo ""
        echo "📝 Bitbucket Setup:"
        echo "1. Go to https://bitbucket.org/repo/create"
        echo "2. Create a new repository named 'robo-q'"
        echo "3. Don't initialize with README"
        echo ""
        read -p "Enter your Bitbucket username: " username
        read -p "Enter repository name (default: robo-q): " repo_name
        repo_name=${repo_name:-robo-q}
        
        remote_url="https://bitbucket.org/$username/$repo_name.git"
        echo ""
        echo "🔗 Adding Bitbucket remote: $remote_url"
        git remote add origin "$remote_url"
        ;;
    4)
        echo ""
        read -p "Enter your custom Git URL: " remote_url
        echo ""
        echo "🔗 Adding custom remote: $remote_url"
        git remote add origin "$remote_url"
        ;;
    5)
        echo ""
        echo "📋 Current remotes:"
        git remote -v
        echo ""
        echo "To add a remote manually:"
        echo "git remote add origin <your-repo-url>"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🔍 Verifying remote was added:"
git remote -v
echo ""

# Check if we have commits to push
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "❌ No commits found. Please make a commit first."
    exit 1
fi

echo "🚀 Ready to push to remote repository!"
echo ""
read -p "Push to remote now? (y/N): " push_now

if [[ $push_now =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Pushing to remote repository..."
    
    # Push with upstream tracking
    if git push -u origin main; then
        echo ""
        echo "✅ Successfully pushed to remote repository!"
        echo ""
        echo "🎉 Your Robo-Q project is now on Git!"
        echo "📋 Repository URL: $remote_url"
        echo ""
        echo "🔗 Next steps:"
        echo "• Visit your repository online"
        echo "• Add collaborators if needed"
        echo "• Set up CI/CD pipelines"
        echo "• Configure branch protection rules"
        echo ""
        echo "📝 To push future changes:"
        echo "git add ."
        echo "git commit -m 'Your commit message'"
        echo "git push"
    else
        echo ""
        echo "❌ Failed to push to remote repository."
        echo "💡 This might be because:"
        echo "• Repository doesn't exist"
        echo "• Authentication failed"
        echo "• Network issues"
        echo ""
        echo "🔧 Try these solutions:"
        echo "1. Make sure the repository exists on the platform"
        echo "2. Check your credentials"
        echo "3. Try: git push -u origin main --force (if repository is empty)"
    fi
else
    echo ""
    echo "📋 Remote added but not pushed yet."
    echo "💡 To push later, run:"
    echo "git push -u origin main"
fi

echo ""
echo "🎯 Git Setup Complete!"
